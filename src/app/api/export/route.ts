import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { Reference } from "@/lib/types";

export async function GET(request: NextRequest) {
  const db = getDb();
  const format = request.nextUrl.searchParams.get("format") || "json";

  const references = db.prepare(`SELECT * FROM references_table ORDER BY code`).all() as Reference[];

  const data = references.map((ref) => {
    return {
      code: ref.code,
      nom: ref.nom,
      type: ref.type === "produit" ? "Produit" : "Carrelage",
      dimensions: ref.type === "produit" ? "—" : `${ref.largeur_cm}x${ref.longueur_cm} cm`,
      pieces_par_caisse: ref.pieces_par_boite,
      m2_par_caisse: ref.type === "produit" ? 0 : Math.round(ref.m2_par_boite * 10000) / 10000,
      prix_unitaire: ref.prix_unitaire,
      quantite: ref.quantite,
      total_m2: ref.type === "produit" ? 0 : Math.round(ref.total_m2 * 100) / 100,
      valeur_stock: Math.round(ref.valeur_stock * 100) / 100,
      date_creation: ref.created_at,
    };
  });

  if (format === "json") {
    return NextResponse.json(data);
  }

  return NextResponse.json(data);
}
