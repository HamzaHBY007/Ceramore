import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { ReferenceWithCalibres, Calibre, Reference } from "@/lib/types";

export async function GET(request: NextRequest) {
  const db = getDb();
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const calibreFilter = searchParams.get("calibre") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const lowStockOnly = searchParams.get("lowStock") === "true";

  let query = `SELECT * FROM references_table WHERE 1=1`;
  const params: (string | number)[] = [];

  if (search) {
    query += ` AND (code LIKE ? OR nom LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
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

  const result: ReferenceWithCalibres[] = references.map((ref) => {
    const calibres = db
      .prepare(`SELECT * FROM calibres WHERE reference_id = ? ORDER BY nom`)
      .all(ref.id) as Calibre[];

    let filteredCalibres = calibres;
    if (calibreFilter) {
      filteredCalibres = calibres.filter((c) =>
        c.nom.toLowerCase().includes(calibreFilter.toLowerCase())
      );
      if (filteredCalibres.length === 0 && calibreFilter) {
        return null;
      }
    }

    const total_boites = calibres.reduce((sum, c) => sum + c.quantite_boites, 0);
    const total_m2 = total_boites * ref.m2_par_boite;
    const valeur_stock = total_m2 * ref.prix_unitaire_m2;
    const is_low_stock = total_boites <= ref.seuil_alerte;

    if (lowStockOnly && !is_low_stock) return null;

    return {
      ...ref,
      calibres: filteredCalibres.length > 0 ? filteredCalibres : calibres,
      total_boites,
      total_m2: Math.round(total_m2 * 100) / 100,
      valeur_stock: Math.round(valeur_stock * 100) / 100,
      is_low_stock,
    };
  }).filter(Boolean) as ReferenceWithCalibres[];

  const stats = {
    total_references: result.length,
    total_boites: result.reduce((s, r) => s + r.total_boites, 0),
    total_m2: Math.round(result.reduce((s, r) => s + r.total_m2, 0) * 100) / 100,
    total_valeur: Math.round(result.reduce((s, r) => s + r.valeur_stock, 0) * 100) / 100,
    low_stock_count: result.filter((r) => r.is_low_stock).length,
  };

  return NextResponse.json({ references: result, stats });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { code, nom, largeur_cm, longueur_cm, pieces_par_boite, prix_unitaire_m2, seuil_alerte, calibres } = body;

  const m2_par_boite = (largeur_cm / 100) * (longueur_cm / 100) * pieces_par_boite;

  const insertRef = db.prepare(`
    INSERT INTO references_table (code, nom, largeur_cm, longueur_cm, pieces_par_boite, m2_par_boite, prix_unitaire_m2, seuil_alerte)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCalibre = db.prepare(`
    INSERT INTO calibres (reference_id, nom, quantite_boites) VALUES (?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO stock_history (reference_id, calibre_id, type, quantite_boites, note) VALUES (?, ?, 'entree', ?, ?)
  `);

  const transaction = db.transaction(() => {
    const result = insertRef.run(
      code, nom, largeur_cm, longueur_cm, pieces_par_boite,
      Math.round(m2_par_boite * 10000) / 10000,
      prix_unitaire_m2 || 0,
      seuil_alerte || 5
    );
    const refId = result.lastInsertRowid as number;

    if (calibres && calibres.length > 0) {
      for (const cal of calibres) {
        const calResult = insertCalibre.run(refId, cal.nom, cal.quantite_boites || 0);
        if (cal.quantite_boites > 0) {
          insertHistory.run(refId, calResult.lastInsertRowid, cal.quantite_boites, "Stock initial");
        }
      }
    } else {
      insertCalibre.run(refId, "Standard", 0);
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
  const { id, code, nom, largeur_cm, longueur_cm, pieces_par_boite, prix_unitaire_m2, seuil_alerte, calibres } = body;

  const m2_par_boite = (largeur_cm / 100) * (longueur_cm / 100) * pieces_par_boite;

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE references_table SET code=?, nom=?, largeur_cm=?, longueur_cm=?, pieces_par_boite=?, m2_par_boite=?, prix_unitaire_m2=?, seuil_alerte=?, updated_at=datetime('now')
      WHERE id=?
    `).run(code, nom, largeur_cm, longueur_cm, pieces_par_boite, Math.round(m2_par_boite * 10000) / 10000, prix_unitaire_m2 || 0, seuil_alerte || 5, id);

    if (calibres) {
      const existingCalibres = db.prepare(`SELECT id, nom FROM calibres WHERE reference_id = ?`).all(id) as { id: number; nom: string }[];
      const existingNames = new Set(existingCalibres.map((c) => c.nom));
      const newNames = new Set(calibres.map((c: { nom: string }) => c.nom));

      for (const existing of existingCalibres) {
        if (!newNames.has(existing.nom)) {
          db.prepare(`DELETE FROM calibres WHERE id = ?`).run(existing.id);
        }
      }

      for (const cal of calibres) {
        if (existingNames.has(cal.nom)) {
          db.prepare(`UPDATE calibres SET quantite_boites = ? WHERE reference_id = ? AND nom = ?`).run(cal.quantite_boites || 0, id, cal.nom);
        } else {
          const calResult = db.prepare(`INSERT INTO calibres (reference_id, nom, quantite_boites) VALUES (?, ?, ?)`).run(id, cal.nom, cal.quantite_boites || 0);
          if (cal.quantite_boites > 0) {
            db.prepare(`INSERT INTO stock_history (reference_id, calibre_id, type, quantite_boites, note) VALUES (?, ?, 'entree', ?, ?)`).run(id, calResult.lastInsertRowid, cal.quantite_boites, "Ajout calibre");
          }
        }
      }
    }

    saveSnapshot(db);
  });

  try {
    transaction();
    return NextResponse.json({ success: true, m2_par_boite: Math.round(m2_par_boite * 10000) / 10000 });
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
      COALESCE(SUM(c.quantite_boites), 0) as total_boites,
      COALESCE(SUM(c.quantite_boites * r.m2_par_boite), 0) as total_m2,
      COALESCE(SUM(c.quantite_boites * r.m2_par_boite * r.prix_unitaire_m2), 0) as total_valeur
    FROM calibres c
    JOIN references_table r ON c.reference_id = r.id
  `).get() as { total_boites: number; total_m2: number; total_valeur: number };

  const existing = db.prepare(`SELECT id FROM stock_snapshots WHERE date = ?`).get(today);
  if (existing) {
    db.prepare(`UPDATE stock_snapshots SET total_m2=?, total_valeur=?, total_boites=? WHERE date=?`).run(
      Math.round(totals.total_m2 * 100) / 100,
      Math.round(totals.total_valeur * 100) / 100,
      totals.total_boites,
      today
    );
  } else {
    db.prepare(`INSERT INTO stock_snapshots (date, total_m2, total_valeur, total_boites) VALUES (?, ?, ?, ?)`).run(
      today,
      Math.round(totals.total_m2 * 100) / 100,
      Math.round(totals.total_valeur * 100) / 100,
      totals.total_boites
    );
  }
}
