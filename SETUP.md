# IMKON Doors — Setup Checklist (Phase 0)

This is everything you need to run Phase 0 locally and open the Mini App from
your bot, seeing your own verified Telegram identity.

---

## 1. Accounts & keys to create

### A. Telegram bot (BotFather)
1. Open [@BotFather](https://t.me/BotFather) in Telegram → `/newbot`.
2. Choose a name and username. Copy the **bot token** it gives you
   → this is `TELEGRAM_BOT_TOKEN`.
3. (Optional, later) `/setmenubutton` to add a permanent "Open" button.

### B. Supabase project
1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
3. **SQL Editor → New query**, paste the contents of
   `supabase/migrations/0001_init.sql`, and run it. This creates all tables,
   enums, and RLS policies.

### C. A public HTTPS tunnel (local dev only)
Telegram only loads a Mini App over **HTTPS**, so `localhost` won't work
directly. Use a tunnel pointing at port 3000. Easiest is Cloudflare:

```bash
# one-time install (macOS): brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

It prints a URL like `https://abcd-1234.trycloudflare.com`.
That URL → `MINI_APP_URL`. (ngrok works too: `ngrok http 3000`.)

> In production this is just your Vercel domain — no tunnel needed.

---

## 2. Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Where it goes | From |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | server only | BotFather |
| `MINI_APP_URL` | server (bot) | your tunnel / Vercel URL |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Supabase API settings |

`.env.local` is gitignored. Never commit real keys.

---

## 3. Run it locally

Three processes (three terminals):

```bash
# 1) the tunnel — copy its https URL into MINI_APP_URL in .env.local
cloudflared tunnel --url http://localhost:3000

# 2) the Mini App (Next.js)
npm run dev

# 3) the bot (grammY, long-polling)
npm run bot
```

> Order matters only in that `MINI_APP_URL` must be set before you start the
> bot. If you change it, restart `npm run bot`.

---

## 4. Test the flow

1. Open your bot in Telegram, send `/start`.
2. Tap **"🚪 IMKON Doors'ni ochish"** — the Mini App opens full-screen.
3. You should see your name, **@username**, and **Telegram ID**, with
   "✓ Telegram identifikatoringiz serverda tasdiqlandi."
4. Check Supabase → **Table editor → users**: a row with your `telegram_id`
   now exists.

If you open the Mini App URL in a plain browser instead, you'll correctly see
"Bu ilovani Telegram bot orqali oching" — because there's no signed
`initData` outside Telegram.

---

## 5. What works after Phase 0
- Bot `/start` → launch button → Mini App opens inside Telegram.
- Mini App reads `initData`; the **server validates the signature** against the
  bot token (HMAC-SHA256) before trusting anything.
- A `users` row is created/updated keyed by `telegram_id`.
- Full database schema + RLS is live (only the catalog is browser-readable;
  everything user-specific is server-only).

**Not yet (later phases):** phone OTP (Phase 2),
cart/reservations/Click deposits (Phase 3), install scheduling (3.5),
invoices (Phase 4).

---

# Phase 1 — Catalog & 3D showroom + admin

## Extra setup on top of Phase 0

1. **Run the new migration:** paste `supabase/migrations/0002_storage_and_seed.sql`
   into the Supabase SQL editor and run it. This creates the public
   `door-models` + `door-images` storage buckets and seeds one placeholder
   door (procedural, no file needed) so Home isn't empty.

2. **New env vars** (add to `.env.local`):
   | Variable | What |
   |---|---|
   | `NEXT_PUBLIC_BOT_USERNAME` | your bot's @username **without** the @ (for the admin login widget) |
   | `ADMIN_TELEGRAM_IDS` | comma-separated Telegram IDs of the ~3 admins (find yours via [@userinfobot](https://t.me/userinfobot)) |
   | `ADMIN_SESSION_SECRET` | optional; a long random string for signing admin cookies (falls back to the bot token) |

3. **Tell BotFather the admin domain** (needed for the Telegram Login Widget):
   `/setdomain` → pick your bot → send your site's domain (your tunnel host,
   e.g. `abcd-1234.trycloudflare.com`, or your Vercel domain).

## How to test
- **Customer:** open the Mini App → you land on **Home** with the seeded door,
  search, category chips, and a **Filtrlar** panel. Tap the door → the detail
  screen lazy-loads the **3D viewer** (drag to rotate, pinch to zoom). With no
  `.glb` it renders the **procedural door**; the bottom nav (Home · Savat ·
  Buyurtmalar · Profil) is live (the last three are "tez kunda" stubs; Profil
  shows your verified identity).
- **Admin:** visit `/admin` in a browser → log in with the Telegram widget
  (your ID must be in `ADMIN_TELEGRAM_IDS`) → add/edit doors, upload images and
  a `.glb`, set price/deposit (with an **Auto** tiered-deposit suggestion),
  stock, featured/active.

> **Note on 3D:** Draco/meshopt decoders are fetched from Google's CDN on first
> model load. Real `.glb` files should be compressed (Draco/meshopt) and kept
> lean (target a few MB) per the spec's performance rules.

## What works after Phase 1
- Home catalog: all active doors, instant client-side search + filters
  (category, price, finish, lock type), featured row, limited-stock badges.
- Product detail with a lazy-loaded Three.js viewer, image fallback, and a
  WebGL-failure fallback.
- Admin dashboard (Telegram-ID allowlist) for full catalog CRUD + uploads.

**Not yet:** the Reserve button is a Phase 3 stub; Cart/Orders are stubs;
phone OTP is Phase 2.
