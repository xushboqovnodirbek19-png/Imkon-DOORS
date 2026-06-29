import { NextResponse } from "next/server";
import { validateInitData } from "@/lib/telegram/validateInitData";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // needs node:crypto + service-role client

/**
 * POST /api/auth
 * Body: { initData: string }  — the raw Telegram Mini App initData string.
 *
 * Validates the signature server-side, then upserts the `users` row keyed by
 * telegram_id and returns the app user. This is the ONLY place the user's
 * identity is established; the client never asserts it.
 */
export async function POST(request: Request) {
  let body: { initData?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const initData = body.initData ?? "";
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { error: "server misconfigured: missing bot token" },
      { status: 500 },
    );
  }

  const result = validateInitData(initData, botToken);
  if (!result.ok) {
    return NextResponse.json(
      { error: "unauthorized", reason: result.reason },
      { status: 401 },
    );
  }

  const tg = result.user;
  const fullName = [tg.first_name, tg.last_name].filter(Boolean).join(" ") || null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(
      { telegram_id: tg.id, full_name: fullName },
      { onConflict: "telegram_id" },
    )
    .select("id, telegram_id, phone, phone_verified, full_name, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "database error", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    user: data,
    telegram: {
      id: tg.id,
      username: tg.username ?? null,
      first_name: tg.first_name ?? null,
      last_name: tg.last_name ?? null,
      photo_url: tg.photo_url ?? null,
    },
  });
}
