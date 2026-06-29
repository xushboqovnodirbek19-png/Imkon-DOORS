import type { NextConfig } from "next";

/**
 * Image allowlist for the catalog.
 *
 * Catalog/detail photos are rendered with plain <img> tags, so what governs
 * whether they load is the Content-Security-Policy `img-src` directive. We set
 * ONLY `img-src` (no `default-src`) so the rest of the app is unaffected — the
 * Telegram Web App script (telegram.org) and Supabase API calls keep working.
 *
 * `https:` allows every HTTPS image host, which covers:
 *   • placehold.co        — the catalog placeholder photos
 *   • *.supabase.co       — real door photos uploaded to Supabase Storage
 *   • Telegram avatars    — user.photo_url on the profile screen
 * while still blocking plain-http (mixed content). Tighten to named hosts later
 * if you want a stricter policy.
 */
const cspHeader = "img-src 'self' data: blob: https:;";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "Content-Security-Policy", value: cspHeader }],
      },
    ];
  },
  // Forward-compat: if any catalog image is migrated to next/image, allow the
  // placeholder + Supabase Storage hosts through the optimizer too.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
