import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE-ROLE key.
 *
 * This key bypasses Row Level Security, so it must NEVER reach the browser.
 * The `server-only` import above makes the build fail if this module is ever
 * imported into a Client Component.
 *
 * All privileged reads/writes (users, reservations, payments, OTP, …) go
 * through this client, with per-user ownership enforced in the API against
 * the server-validated Telegram identity.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
