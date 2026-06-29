import "server-only";
import crypto from "node:crypto";

/**
 * Server-side validation of Telegram Mini App `initData` (spec §8, §14).
 *
 * Telegram signs the launch payload with a key derived from the bot token.
 * We recompute the signature and compare it in constant time. The client is
 * NEVER trusted to assert who it is — identity comes only from a payload that
 * passes this check.
 *
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export type ValidateResult =
  | { ok: true; user: TelegramUser; authDate: Date }
  | { ok: false; reason: string };

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS,
): ValidateResult {
  if (!initData) return { ok: false, reason: "empty initData" };
  if (!botToken) return { ok: false, reason: "missing bot token" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "missing hash" };

  // Build the data-check-string: every field except `hash`, sorted by key,
  // joined as `key=value` with newlines.
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  // secret_key = HMAC_SHA256(key="WebAppData", message=botToken)
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Constant-time comparison.
  const a = Buffer.from(computedHash, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature mismatch" };
  }

  // Freshness check to limit replay of leaked payloads.
  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) return { ok: false, reason: "missing auth_date" };
  const authDate = new Date(Number(authDateRaw) * 1000);
  if (Number.isNaN(authDate.getTime())) {
    return { ok: false, reason: "invalid auth_date" };
  }
  const ageSeconds = (Date.now() - authDate.getTime()) / 1000;
  if (ageSeconds > maxAgeSeconds) {
    return { ok: false, reason: "initData expired" };
  }

  const userRaw = params.get("user");
  if (!userRaw) return { ok: false, reason: "missing user" };
  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    return { ok: false, reason: "invalid user json" };
  }
  if (typeof user.id !== "number") {
    return { ok: false, reason: "invalid user id" };
  }

  return { ok: true, user, authDate };
}
