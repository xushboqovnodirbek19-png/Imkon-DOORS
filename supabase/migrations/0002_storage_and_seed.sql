-- ════════════════════════════════════════════════════════════════════════
-- IMKON Doors — storage buckets + catalog seed (Phase 1)
-- Run after 0001_init.sql.
-- ════════════════════════════════════════════════════════════════════════

-- ── Storage buckets ─────────────────────────────────────────────────────
-- Public buckets so the .glb models and images can be served over the CDN.
-- Uploads happen server-side with the service-role key (bypasses policies).
insert into storage.buckets (id, name, public)
values
  ('door-models', 'door-models', true),
  ('door-images', 'door-images', true)
on conflict (id) do nothing;

-- Public read for both buckets (browser fetches models/images directly).
drop policy if exists "door_assets_public_read" on storage.objects;
create policy "door_assets_public_read" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id in ('door-models', 'door-images'));

-- ── Seed: one procedural placeholder door ───────────────────────────────
-- model_3d_url is NULL, so the viewer renders the procedural door — the
-- catalog and 3D viewer are testable before any real photo/model is added.
insert into doors (
  id, name, category, description, price, deposit_amount, stock_count,
  model_3d_url, image_urls, specs, is_featured, is_active
)
values (
  '00000000-0000-0000-0000-000000000001',
  'IMKON Premium S7',
  'entry',
  'Xitoydan import qilingan yuqori sifatli xavfsizlik eshigi. ' ||
  'Issiqlik va tovush izolyatsiyasi, bio-qulf tizimi.',
  4500000,
  1100000,
  8,
  null,
  '{}',
  '{"width_cm":96,"height_cm":205,"thickness_cm":7,"material":"Po''lat",'
  '"finish":"Matt qora","lock_type":"Bio-qulf","color":"#3f3f46"}'::jsonb,
  true,
  true
)
on conflict (id) do nothing;
