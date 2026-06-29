import { NextResponse, type NextRequest } from "next/server";
import { getActiveDoors } from "@/lib/doors";
import type { DoorFilters } from "@/lib/types";

export const runtime = "nodejs";

/** GET /api/doors — public catalog list with optional search + filters. */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const num = (v: string | null) =>
    v !== null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined;

  const filters: DoorFilters = {
    q: sp.get("q") || undefined,
    category: sp.get("category") || undefined,
    finish: sp.get("finish") || undefined,
    lockType: sp.get("lockType") || undefined,
    priceMin: num(sp.get("priceMin")),
    priceMax: num(sp.get("priceMax")),
    featured: sp.get("featured") === "1" || undefined,
  };

  try {
    const doors = await getActiveDoors(filters);
    return NextResponse.json({ doors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
