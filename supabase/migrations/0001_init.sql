-- ════════════════════════════════════════════════════════════════════════
-- IMKON Doors — initial schema (spec §5)
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- Access model (see §14):
--   • All privileged reads/writes go through our Next.js API using the
--     SERVICE-ROLE key, which BYPASSES RLS. Per-user ownership is enforced
--     in the API against the server-validated Telegram identity.
--   • RLS is enabled on every table as defense-in-depth: the browser's
--     `anon` key can read ONLY the public catalog (active doors) and nothing
--     user-specific. It can never see another customer's reservations.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type reservation_status as enum
    ('pending', 'deposit_paid', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfilment_type as enum ('pickup', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_provider as enum ('click', 'payme');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('created', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum
    ('requested', 'assigned', 'done', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── users ───────────────────────────────────────────────────────────────
create table if not exists users (
  id             uuid primary key default gen_random_uuid(),
  telegram_id    bigint unique not null,
  phone          text,
  phone_verified boolean not null default false,
  full_name      text,
  created_at     timestamptz not null default now()
);

-- ── doors (catalog) ─────────────────────────────────────────────────────
create table if not exists doors (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text,                       -- entry / security / interior
  description    text,
  price          numeric(14,2) not null default 0,   -- display price in UZS
  deposit_amount numeric(14,2) not null default 0,   -- resolved deposit
  stock_count    int not null default 0,
  model_3d_url   text,                        -- URL to .glb file
  image_urls     text[] not null default '{}',
  specs          jsonb not null default '{}'::jsonb,
  is_featured    boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ── reservations ────────────────────────────────────────────────────────
create table if not exists reservations (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references users(id) on delete cascade,
  status                   reservation_status not null default 'pending',
  delivery_address         text,
  contact_phone            text,
  notes                    text,
  total_amount             numeric(14,2) not null default 0,
  deposit_paid             numeric(14,2) not null default 0,
  fulfilment               fulfilment_type not null default 'pickup',
  installation_booking_id  uuid,             -- FK added after bookings table
  created_at               timestamptz not null default now()
);

-- ── reservation_items ───────────────────────────────────────────────────
create table if not exists reservation_items (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  door_id        uuid not null references doors(id),
  quantity       int not null default 1,
  unit_price     numeric(14,2) not null     -- price snapshot at order time
);

-- ── payments ────────────────────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  reservation_id  uuid not null references reservations(id) on delete cascade,
  provider        payment_provider not null,
  provider_txn_id text,
  amount          numeric(14,2) not null,
  status          payment_status not null default 'created',
  created_at      timestamptz not null default now()
);

-- ── otp_codes ───────────────────────────────────────────────────────────
create table if not exists otp_codes (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null,
  code_hash  text not null,                  -- never store raw codes
  expires_at timestamptz not null,
  attempts   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists otp_codes_phone_idx on otp_codes (phone);

-- ── invoices ────────────────────────────────────────────────────────────
create table if not exists invoices (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  invoice_number text not null unique,
  pdf_url        text,
  issued_at      timestamptz not null default now()
);

-- ── craftsmen (installers) ──────────────────────────────────────────────
create table if not exists craftsmen (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text,
  is_active      boolean not null default true,
  daily_capacity int not null default 1,
  working_days   jsonb not null default '[1,2,3,4,5]'::jsonb,  -- ISO weekdays
  created_at     timestamptz not null default now()
);

-- ── installation_bookings ───────────────────────────────────────────────
create table if not exists installation_bookings (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  craftsman_id   uuid references craftsmen(id),   -- assigned by admin
  scheduled_date date not null,
  address        text,
  status         booking_status not null default 'requested',
  created_at     timestamptz not null default now()
);

-- Deferred FK: reservation → chosen install slot.
do $$ begin
  alter table reservations
    add constraint reservations_installation_booking_fk
    foreign key (installation_booking_id)
    references installation_bookings(id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists reservations_user_idx on reservations (user_id);
create index if not exists reservation_items_res_idx on reservation_items (reservation_id);
create index if not exists payments_res_idx on payments (reservation_id);

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table users                 enable row level security;
alter table doors                 enable row level security;
alter table reservations          enable row level security;
alter table reservation_items     enable row level security;
alter table payments              enable row level security;
alter table otp_codes             enable row level security;
alter table invoices              enable row level security;
alter table craftsmen             enable row level security;
alter table installation_bookings enable row level security;

-- Public catalog: anyone (anon) may read ACTIVE doors only.
drop policy if exists "doors_public_read" on doors;
create policy "doors_public_read" on doors
  for select
  to anon, authenticated
  using (is_active = true);

-- Every other table has RLS enabled with NO permissive policy, so the
-- anon/authenticated browser keys are denied entirely. Only the service-role
-- key (used server-side) can touch them. This guarantees a customer can
-- never read another customer's reservations from the client.
