import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { ReferenceWithDetails, Reference } from "@/lib/types";

export async function GET(request: NextRequest) {
  const db = getDb();
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const dimension = searchParams.get("dimension") || "";
  const codeFilter = searchParams.get("code") || "";
  const nomFilter = searchParams.get("nom") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const typeFilter = searchParams.get("type") || "";

  let query = `SELECT * FROM references_table WHERE 1=1`;
  const params: (string | number)[] = [];

  if (search) {
    query += ` AND (code LIKE ? OR nom LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (codeFilter) {
    query += ` AND code = ?`;
    params.push(codeFilter);
  }

  if (nomFilter) {
    query += ` AND nom = ?`;
    params.push(nomFilter);
  }

  if (dimension) {
    const parts = dimension.split("x");
    if (parts.length === 2) {
      query += ` AND largeur_cm = ? AND longueur_cm = ?`;
      params.push(parseFloat(parts[0]), parseFloat(parts[1]));
    }
  }

  if (typeFilter) {
    query += ` AND type = ?`;
    params.push(typeFilter);
  }

  if (dateFrom) {
    query += ` AND created_at >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    query += ` AND created_at <= ?`;
    params.push(dateTo + " 23:59:59");
  }

  query += ` ORDER BY updated_at DESC`;

  const references = db.prepare(query).all(...params) as Reference[];

  const result: ReferenceWithDetails[] = references.map((ref) => ({
    ...ref,
    is_product: ref.type === "produit",
  }));

  const stats = {
    total_references: result.length,
    total_caises: result.reduce((s, r) => s + r.quantite_caises, 0),
    total_m2: Math.round(result.reduce((s, r) => s + r.total_m2, 0) * 100) / 100,
    total_valeur: Math.round(result.reduce((s, r) => s + r.valeur_stock, 0) * 100) / 100,
  };

  // Collect filter options from ALL data (not filtered)
  const allRefs = db.prepare(`SELECT code, nom, largeur_cm, longueur_cm FROM references_table ORDER BY code`).all() as { code: string; nom: string; largeur_cm: number; longueur_cm: number }[];
  const filterOptions = {
    codes: [...new Set(allRefs.map((r) => r.code))],
    noms: [...new Set(allRefs.filter((r) => r.nom).map((r) => r.nom))],
    dimensions: [...new Set(allRefs.filter((r) => r.largeur_cm > 0).map((r) => `${r.largeur_cm}x${r.longueur_cm}`))],
  };

  return NextResponse.json({ references: result, stats, filterOptions });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { code, nom, largeur_cm, longueur_cm, pieces_par_boite, prix_unitaire_m2, quantite_caises, type } = body;

  const isProduct = type === "produit";

  const m2_par_boite = isProduct ? 0 : (largeur_cm / 100) * (longueur_cm / 100) * pieces_par_boite;
  const total_m2 = isProduct ? 0 : quantite_caises * m2_par_boite;
  const valeur_stock = isProduct
    ? quantite_caises * prix_unitaire_m2
    : total_m2 * prix_unitaire_m2;

  const insertRef = db.prepare(`
    INSERT INTO references_table (code, nom, largeur_cm, longueur_cm, pieces_par_boite, m2_par_boite, prix_unitaire_m2, quantite_caises, total_m2, valeur_stock, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const result = insertRef.run(
      code,
      nom || "",
      isProduct ? 0 : largeur_cm,
      isProduct ? 0 : longueur_cm,
      isProduct ? (pieces_par_boite || 0) : pieces_par_boite,
      Math.round(m2_par_boite * 10000) / 10000,
      prix_unitaire_m2,
      quantite_caises,
      Math.round(total_m2 * 100) / 100,
      Math.round(valeur_stock * 100) / 100,
      type || "carrelage"
    );
    const refId = result.lastInsertRowid as number;

    if (quantite_caises > 0) {
      db.prepare(`INSERT INTO stock_history (reference_id, type, quantite_caises, note) VALUES (?, 'entree', ?, ?)`).run(refId, quantite_caises, "Stock initial");
    }

    saveSnapshot(db);
    return refId;
  });

  try {
    const refId = transaction();
    return NextResponse.json({ id: refId, m2_par_boite: Math.round(m2_par_boite * 10000) / 10000 }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    if (message.includes("UNIQUE")) {
      return NextResponse.json({ error: "Ce code de référence existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { id, code, nom, largeur_cm, longueur_cm, pieces_par_boite, prix_unitaire_m2, quantite_caises, type } = body;

  const isProduct = type === "produit";

  const m2_par_boite = isProduct ? 0 : (largeur_cm / 100) * (longueur_cm / 100) * pieces_par_boite;
  const total_m2 = isProduct ? 0 : quantite_caises * m2_par_boite;
  const valeur_stock = isProduct
    ? quantite_caises * prix_unitaire_m2
    : total_m2 * prix_unitaire_m2;

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE references_table SET code=?, nom=?, largeur_cm=?, longueur_cm=?, pieces_par_boite=?, m2_par_boite=?, prix_unitaire_m2=?, quantite_caises=?, total_m2=?, valeur_stock=?, type=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      code,
      nom || "",
      isProduct ? 0 : largeur_cm,
      isProduct ? 0 : longueur_cm,
      isProduct ? (pieces_par_boite || 0) : pieces_par_boite,
      Math.round(m2_par_boite * 10000) / 10000,
      prix_unitaire_m2,
      quantite_caises,
      Math.round(total_m2 * 100) / 100,
      Math.round(valeur_stock * 100) / 100,
      type || "carrelage",
      id
    );

    saveSnapshot(db);
  });

  try {
    transaction();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { id } = await request.json();

  db.prepare(`DELETE FROM references_table WHERE id = ?`).run(id);
  saveSnapshot(db);

  return NextResponse.json({ success: true });
}

function saveSnapshot(db: ReturnType<typeof getDb>) {
  const today = new Date().toISOString().split("T")[0];

  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(quantite_caises), 0) as total_caises,
      COALESCE(SUM(total_m2), 0) as total_m2,
      COALESCE(SUM(valeur_stock), 0) as total_valeur
    FROM references_table
  `).get() as { total_caises: number; total_m2: number; total_valeur: number };

  const existing = db.prepare(`SELECT id FROM stock_snapshots WHERE date = ?`).get(today);
  if (existing) {
    db.prepare(`UPDATE stock_snapshots SET total_m2=?, total_valeur=?, total_caises=? WHERE date=?`).run(
      Math.round(totals.total_m2 * 100) / 100,
      Math.round(totals.total_valeur * 100) / 100,
      totals.total_caises,
      today
    );
  } else {
    db.prepare(`INSERT INTO stock_snapshots (date, total_m2, total_valeur, total_caises) VALUES (?, ?, ?, ?)`).run(
      today,
      Math.round(totals.total_m2 * 100) / 100,
      Math.round(totals.total_valeur * 100) / 100,
      totals.total_caises
    );
  }
}
