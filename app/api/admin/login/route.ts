import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isAdmin,
  validateLoginWidget,
  type TelegramLoginData,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/login
 * Body: the Telegram Login Widget payload (id, auth_date, hash, …).
 * Validates the signature, checks the admin allowlist, sets a signed cookie.
 */
export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  let data: TelegramLoginData;
  try {
    data = (await request.json()) as TelegramLoginData;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const result = validateLoginWidget(data, botToken);
  if (!result.ok) {
    return NextResponse.json(
      { error: "unauthorized", reason: result.reason },
      { status: 401 },
    );
  }
  if (!isAdmin(result.id)) {
    return NextResponse.json(
      { error: "not an admin", reason: "telegram id not on allowlist" },
      { status: 403 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(result.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
