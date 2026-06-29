import { NextResponse } from "next/server";
import { getDoorById } from "@/lib/doors";

export const runtime = "nodejs";

/** GET /api/doors/[id] — single active door. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const door = await getDoorById(id);
    if (!door) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ door });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
