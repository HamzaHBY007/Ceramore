import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const searchParams = request.nextUrl.searchParams;
  const referenceId = searchParams.get("referenceId");
  const limit = parseInt(searchParams.get("limit") || "100");

  let query = `
    SELECT sh.*, r.code as reference_code, r.nom as reference_nom, c.nom as calibre_nom
    FROM stock_history sh
    JOIN references_table r ON sh.reference_id = r.id
    LEFT JOIN calibres c ON sh.calibre_id = c.id
  `;
  const params: (string | number)[] = [];

  if (referenceId) {
    query += ` WHERE sh.reference_id = ?`;
    params.push(parseInt(referenceId));
  }

  query += ` ORDER BY sh.date_entry DESC LIMIT ?`;
  params.push(limit);

  const history = db.prepare(query).all(...params);
  return NextResponse.json(history);
}

