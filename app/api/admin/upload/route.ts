import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminFromCookies } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload  (multipart/form-data)
 * Fields: file (File), kind ("model" | "image").
 * Uploads to the matching Supabase Storage bucket and returns the public URL.
 */
export async function POST(request: Request) {
  if ((await getAdminFromCookies()) === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const isModel = kind === "model";
  const bucket = isModel ? "door-models" : "door-images";
  const ext = (file.name.split(".").pop() || "").toLowerCase();

  if (isModel && ext !== "glb") {
    return NextResponse.json({ error: "model must be a .glb" }, { status: 400 });
  }
  if (!isModel && !["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return NextResponse.json(
      { error: "image must be jpg/png/webp" },
      { status: 400 },
    );
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || (isModel ? "model/gltf-binary" : undefined),
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
