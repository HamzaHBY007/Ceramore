import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { reference_id, calibre_id, type, quantite_boites, note } = body;

  if (!reference_id || !type || !quantite_boites || quantite_boites <= 0) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO stock_history (reference_id, calibre_id, type, quantite_boites, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(reference_id, calibre_id || null, type, quantite_boites, note || null);

    if (calibre_id) {
      if (type === "entree") {
        db.prepare(`UPDATE calibres SET quantite_boites = quantite_boites + ? WHERE id = ?`).run(quantite_boites, calibre_id);
      } else {
        db.prepare(`UPDATE calibres SET quantite_boites = MAX(0, quantite_boites - ?) WHERE id = ?`).run(quantite_boites, calibre_id);
      }
    }

    db.prepare(`UPDATE references_table SET updated_at = datetime('now') WHERE id = ?`).run(reference_id);

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
  });

  try {
    transaction();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
