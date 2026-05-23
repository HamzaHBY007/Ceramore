import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { Reference } from "@/lib/types";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { reference_id, type, quantite_caises, note } = body;

  if (!reference_id || !type || !quantite_caises || quantite_caises <= 0) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO stock_history (reference_id, type, quantite_caises, note)
      VALUES (?, ?, ?, ?)
    `).run(reference_id, type, quantite_caises, note || null);

    const ref = db.prepare(`SELECT * FROM references_table WHERE id = ?`).get(reference_id) as Reference;

    let newCaises: number;
    if (type === "entree") {
      newCaises = ref.quantite_caises + quantite_caises;
    } else {
      newCaises = Math.max(0, ref.quantite_caises - quantite_caises);
    }

    const isProduct = ref.type === "produit";
    const total_m2 = isProduct ? 0 : newCaises * ref.m2_par_boite;
    const valeur_stock = isProduct ? newCaises * ref.prix_unitaire_m2 : total_m2 * ref.prix_unitaire_m2;

    db.prepare(`UPDATE references_table SET quantite_caises=?, total_m2=?, valeur_stock=?, updated_at=datetime('now') WHERE id=?`).run(
      newCaises,
      Math.round(total_m2 * 100) / 100,
      Math.round(valeur_stock * 100) / 100,
      reference_id
    );

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
  });

  try {
    transaction();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
