import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30");

  const snapshots = db.prepare(`
    SELECT * FROM stock_snapshots 
    ORDER BY date DESC 
    LIMIT ?
  `).all(days);

  return NextResponse.json((snapshots as Array<Record<string, unknown>>).reverse());
}
