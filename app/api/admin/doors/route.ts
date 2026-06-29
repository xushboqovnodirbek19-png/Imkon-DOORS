import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const DOOR_COLUMNS =
  "id, name, category, description, price, deposit_amount, stock_count, " +
  "model_3d_url, image_urls, specs, is_featured, is_active, created_at";

/** GET /api/admin/doors — ALL doors (including inactive) for the dashboard. */
export async function GET() {
  if ((await getAdminFromCookies()) === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("doors")
    .select(DOOR_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doors: data ?? [] });
}

/** POST /api/admin/doors — create a door. */
export async function POST(request: Request) {
  if ((await getAdminFromCookies()) === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const row = sanitizeDoorInput(body);
  if (!row.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("doors")
    .insert(row)
    .select(DOOR_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ door: data });
}

/** Whitelist + coerce admin-supplied fields. Shared with the [id] route. */
export function sanitizeDoorInput(body: Record<string, unknown>) {
  const numOr = (v: unknown, d = 0) =>
    typeof v === "number" && Number.isFinite(v) ? v : Number(v) || d;
  const str = (v: unknown) => (typeof v === "string" ? v : v == null ? null : String(v));

  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    category: str(body.category),
    description: str(body.description),
    price: numOr(body.price),
    deposit_amount: numOr(body.deposit_amount),
    stock_count: Math.max(0, Math.trunc(numOr(body.stock_count))),
    model_3d_url: str(body.model_3d_url),
    image_urls: Array.isArray(body.image_urls)
      ? body.image_urls.filter((u): u is string => typeof u === "string")
      : [],
    specs:
      body.specs && typeof body.specs === "object" && !Array.isArray(body.specs)
        ? body.specs
        : {},
    is_featured: Boolean(body.is_featured),
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
  };
}
