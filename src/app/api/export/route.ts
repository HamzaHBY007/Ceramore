import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import type { Reference, Calibre } from "@/lib/types";

export async function GET(request: NextRequest) {
  const db = getDb();
  const format = request.nextUrl.searchParams.get("format") || "json";

  const references = db.prepare(`SELECT * FROM references_table ORDER BY code`).all() as Reference[];

  const data = references.map((ref) => {
    const calibres = db.prepare(`SELECT * FROM calibres WHERE reference_id = ?`).all(ref.id) as Calibre[];
    const total_boites = calibres.reduce((s, c) => s + c.quantite_boites, 0);
    const total_m2 = total_boites * ref.m2_par_boite;
    const valeur = total_m2 * ref.prix_unitaire_m2;

    return {
      code: ref.code,
      nom: ref.nom,
      dimensions: `${ref.largeur_cm}x${ref.longueur_cm} cm`,
      pieces_par_boite: ref.pieces_par_boite,
      m2_par_boite: Math.round(ref.m2_par_boite * 10000) / 10000,
      prix_m2: ref.prix_unitaire_m2,
      calibres: calibres.map((c) => `${c.nom}: ${c.quantite_boites}`).join(", "),
      total_boites,
      total_m2: Math.round(total_m2 * 100) / 100,
      valeur_stock: Math.round(valeur * 100) / 100,
      seuil_alerte: ref.seuil_alerte,
      alerte: total_boites <= ref.seuil_alerte ? "OUI" : "NON",
      date_creation: ref.created_at,
    };
  });

  if (format === "json") {
    return NextResponse.json(data);
  }

  return NextResponse.json(data);
}
