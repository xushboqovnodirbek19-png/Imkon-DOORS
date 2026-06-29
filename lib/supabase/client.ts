import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using the ANON (public) key.
 *
 * Subject to Row Level Security: with the Phase 0 policies it can read only
 * the active door catalog and nothing user-specific. Anything sensitive must
 * go through our API routes (which use the service-role client).
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars",
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
