import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { sanitizeDoorInput } from "../route";

export const runtime = "nodejs";

const DOOR_COLUMNS =
  "id, name, category, description, price, deposit_amount, stock_count, " +
  "model_3d_url, image_urls, specs, is_featured, is_active, created_at";

/** PUT /api/admin/doors/[id] — update a door. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if ((await getAdminFromCookies()) === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
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
    .update(row)
    .eq("id", id)
    .select(DOOR_COLUMNS)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ door: data });
}

/** DELETE /api/admin/doors/[id] — soft-delete by setting is_active=false. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if ((await getAdminFromCookies()) === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("doors")
    .update({ is_active: false })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
