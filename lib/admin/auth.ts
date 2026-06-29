import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin authentication (spec §11): a Telegram-ID allowlist, with admins
 * signing in via the Telegram Login Widget on the web dashboard.
 *
 * Login Widget signatures differ from Mini App initData:
 *   secret_key = SHA256(bot_token)           (NOT HMAC("WebAppData", token))
 *   check      = HMAC_SHA256(dataCheckString, secret_key) === hash
 */

export const ADMIN_COOKIE = "imkon_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

export interface TelegramLoginData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  [key: string]: string | number | undefined;
}

function sessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.TELEGRAM_BOT_TOKEN;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET / bot token");
  return secret;
}

/** Parse the comma-separated ADMIN_TELEGRAM_IDS allowlist. */
export function adminAllowlist(): number[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function isAdmin(telegramId: number): boolean {
  return adminAllowlist().includes(telegramId);
}

/** Validate Telegram Login Widget payload. Returns the user id on success. */
export function validateLoginWidget(
  data: TelegramLoginData,
  botToken: string,
  maxAgeSeconds = 60 * 60 * 24,
): { ok: true; id: number } | { ok: false; reason: string } {
  if (!data?.hash) return { ok: false, reason: "missing hash" };
  if (!botToken) return { ok: false, reason: "missing bot token" };

  const pairs: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "hash" || value === undefined) continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(data.hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature mismatch" };
  }

  const ageSeconds = Date.now() / 1000 - Number(data.auth_date);
  if (!Number.isFinite(ageSeconds) || ageSeconds > maxAgeSeconds) {
    return { ok: false, reason: "login expired" };
  }
  if (typeof data.id !== "number") return { ok: false, reason: "invalid id" };

  return { ok: true, id: data.id };
}

// ── Signed session token: base64url(payload).hex(hmac) ───────────────────
function sign(payload: string): string {
  return crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
}

export function createSessionToken(telegramId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ id: telegramId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const { id, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as { id: number; exp: number };
    if (Date.now() / 1000 > exp) return null;
    if (!isAdmin(id)) return null;
    return id;
  } catch {
    return null;
  }
}

/** Read + verify the admin session from cookies. Returns telegram id or null. */
export async function getAdminFromCookies(): Promise<number | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export { SESSION_TTL_SECONDS };
