import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { Reference } from "@/lib/types";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { reference_id, type, quantite, note } = body;

  if (!reference_id || !type || !quantite || quantite <= 0) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO stock_history (reference_id, type, quantite, note)
      VALUES (?, ?, ?, ?)
    `).run(reference_id, type, quantite, note || null);

    const ref = db.prepare(`SELECT * FROM references_table WHERE id = ?`).get(reference_id) as Reference;

    let newQuantite: number;
    if (type === "entree") {
      newQuantite = ref.quantite + quantite;
    } else {
      newQuantite = Math.max(0, ref.quantite - quantite);
    }

    const isProduct = ref.type === "produit";
    const total_m2 = isProduct ? 0 : newQuantite * ref.m2_par_boite;
    const valeur_stock = isProduct ? newQuantite * ref.prix_unitaire : total_m2 * ref.prix_unitaire;

    db.prepare(`UPDATE references_table SET quantite=?, total_m2=?, valeur_stock=?, updated_at=datetime('now') WHERE id=?`).run(
      newQuantite,
      Math.round(total_m2 * 100) / 100,
      Math.round(valeur_stock * 100) / 100,
      reference_id
    );

    const today = new Date().toISOString().split("T")[0];
    const totals = db.prepare(`
      SELECT 
        COALESCE(SUM(quantite), 0) as total_quantite,
        COALESCE(SUM(total_m2), 0) as total_m2,
        COALESCE(SUM(valeur_stock), 0) as total_valeur
      FROM references_table
    `).get() as { total_quantite: number; total_m2: number; total_valeur: number };

    const existing = db.prepare(`SELECT id FROM stock_snapshots WHERE date = ?`).get(today);
    if (existing) {
      db.prepare(`UPDATE stock_snapshots SET total_m2=?, total_valeur=?, total_quantite=? WHERE date=?`).run(
        Math.round(totals.total_m2 * 100) / 100,
        Math.round(totals.total_valeur * 100) / 100,
        totals.total_quantite,
        today
      );
    } else {
      db.prepare(`INSERT INTO stock_snapshots (date, total_m2, total_valeur, total_quantite) VALUES (?, ?, ?, ?)`).run(
        today,
        Math.round(totals.total_m2 * 100) / 100,
        Math.round(totals.total_valeur * 100) / 100,
        totals.total_quantite
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
