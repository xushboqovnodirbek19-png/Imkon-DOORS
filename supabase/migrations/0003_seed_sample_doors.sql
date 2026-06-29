-- ════════════════════════════════════════════════════════════════════════
-- IMKON Doors — sample catalog seed (testing data)
-- Run after 0001_init.sql (and optionally 0002_storage_and_seed.sql).
--
-- Inserts ~10 placeholder doors so the catalog looks full while testing.
-- • Four Shuoguo model families: ZH-155, ZH-162, ZH-164, BY.
-- • Mixed categories (entry / security / interior), colours, finishes, prices.
-- • 3 doors flagged is_featured for the "Tanlangan" home rail.
-- • image_urls use placehold.co placeholders — swap in real Shuoguo photos
--   later (e.g. via the admin upload, which overwrites image_urls).
--
-- Deterministic UUIDs (…0010–0019) + `on conflict do nothing` make this
-- migration safe to re-run; it won't touch the 0002 demo door (…0001).
-- ════════════════════════════════════════════════════════════════════════

insert into doors (
  id, name, category, description, price, deposit_amount, stock_count,
  model_3d_url, image_urls, specs, is_featured, is_active
)
values
  (
    '00000000-0000-0000-0000-000000000010',
    'Shuoguo ZH-155 Klassik',
    'entry',
    'ZH-155 seriyasi kirish eshigi — issiqlik va tovush izolyatsiyasi, '
    || 'po''lat ramka, klassik o''ymakor naqsh.',
    4200000, 1050000, 12, null,
    array[
      'https://placehold.co/800x1000/3f3f46/f1ece2.png?text=ZH-155+Klassik',
      'https://placehold.co/800x1000/52525b/f1ece2.png?text=ZH-155+Detal'
    ],
    '{"model":"ZH-155","width_cm":96,"height_cm":205,"thickness_cm":7,"material":"Po''lat","finish":"Matt qora","lock_type":"Bio-qulf","color":"#3f3f46"}'::jsonb,
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'Shuoguo ZH-155 Yong''oq',
    'entry',
    'ZH-155 yong''oq qoplamali variant — iliq yog''och teksturasi, '
    || 'kundalik foydalanish uchun bardoshli.',
    3900000, 980000, 9, null,
    array[
      'https://placehold.co/800x1000/6b4f2a/f1ece2.png?text=ZH-155+Yongoq'
    ],
    '{"model":"ZH-155","width_cm":90,"height_cm":200,"thickness_cm":7,"material":"Po''lat","finish":"Yong''oq","lock_type":"Bio-qulf","color":"#6b4f2a"}'::jsonb,
    false, true
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'Shuoguo ZH-162 Premium',
    'security',
    'ZH-162 xavfsizlik seriyasi — kuchaytirilgan ko''p nuqtali qulf, '
    || 'o''g''rilikka qarshi metall karkas.',
    6800000, 1700000, 6, null,
    array[
      'https://placehold.co/800x1000/27272a/d8b774.png?text=ZH-162+Premium',
      'https://placehold.co/800x1000/18181b/d8b774.png?text=ZH-162+Qulf'
    ],
    '{"model":"ZH-162","width_cm":100,"height_cm":210,"thickness_cm":9,"material":"Po''lat","finish":"Antratsit","lock_type":"Ko''p nuqtali qulf","color":"#27272a"}'::jsonb,
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'Shuoguo ZH-162 Oq emal',
    'security',
    'ZH-162 oq emal qoplamali — zamonaviy interyerlarga mos, '
    || 'ifloslanishga chidamli yuza.',
    7100000, 1780000, 4, null,
    array[
      'https://placehold.co/800x1000/e5e1d8/27272a.png?text=ZH-162+Oq'
    ],
    '{"model":"ZH-162","width_cm":96,"height_cm":205,"thickness_cm":9,"material":"Po''lat","finish":"Oq emal","lock_type":"Ko''p nuqtali qulf","color":"#e5e1d8"}'::jsonb,
    false, true
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'Shuoguo ZH-164 Lux',
    'entry',
    'ZH-164 lux seriyasi — oltin dub qoplama, bezakli profil, '
    || 'vakolatxona va villalar uchun.',
    8900000, 2225000, 3, null,
    array[
      'https://placehold.co/800x1000/b88a3e/16130e.png?text=ZH-164+Lux',
      'https://placehold.co/800x1000/9c7333/16130e.png?text=ZH-164+Naqsh'
    ],
    '{"model":"ZH-164","width_cm":110,"height_cm":215,"thickness_cm":10,"material":"Po''lat","finish":"Oltin dub","lock_type":"Bio-qulf","color":"#b88a3e"}'::jsonb,
    true, true
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'Shuoguo ZH-164 Wenge',
    'entry',
    'ZH-164 wenge to''q rangli qoplama — qat''iy va nafis ko''rinish, '
    || 'qo''sh kontur zichlagich.',
    8200000, 2050000, 5, null,
    array[
      'https://placehold.co/800x1000/2b211a/d8b774.png?text=ZH-164+Wenge'
    ],
    '{"model":"ZH-164","width_cm":100,"height_cm":210,"thickness_cm":10,"material":"Po''lat","finish":"Wenge","lock_type":"Bio-qulf","color":"#2b211a"}'::jsonb,
    false, true
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    'Shuoguo BY Standart',
    'interior',
    'BY seriyasi ichki eshik — yengil konstruksiya, silliq qoplama, '
    || 'xona va ofislar uchun.',
    2500000, 625000, 20, null,
    array[
      'https://placehold.co/800x1000/cfc8ba/201c15.png?text=BY+Standart'
    ],
    '{"model":"BY","width_cm":80,"height_cm":200,"thickness_cm":4,"material":"MDF","finish":"Oq mat","lock_type":"Magnit qulf","color":"#cfc8ba"}'::jsonb,
    false, true
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'Shuoguo BY Antik mis',
    'interior',
    'BY antik mis bezakli ichki eshik — klassik interyerga mos '
    || 'retro uslubdagi furnitura.',
    2950000, 740000, 14, null,
    array[
      'https://placehold.co/800x1000/7a5a3a/f1ece2.png?text=BY+Antik+Mis'
    ],
    '{"model":"BY","width_cm":85,"height_cm":200,"thickness_cm":4,"material":"MDF","finish":"Antik mis","lock_type":"Magnit qulf","color":"#7a5a3a"}'::jsonb,
    false, true
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    'Shuoguo ZH-162 Antratsit Pro',
    'security',
    'ZH-162 Pro — kengaytirilgan karkas, biometrik qulf tayyor, '
    || 'maksimal himoya darajasi.',
    9500000, 2375000, 2, null,
    array[
      'https://placehold.co/800x1000/1f1f23/d8b774.png?text=ZH-162+Pro',
      'https://placehold.co/800x1000/2a2a30/d8b774.png?text=ZH-162+Biometrik'
    ],
    '{"model":"ZH-162","width_cm":105,"height_cm":215,"thickness_cm":11,"material":"Po''lat","finish":"Antratsit","lock_type":"Biometrik qulf","color":"#1f1f23"}'::jsonb,
    false, true
  ),
  (
    '00000000-0000-0000-0000-000000000019',
    'Shuoguo ZH-155 Kulrang',
    'entry',
    'ZH-155 kulrang matt variant — neytral rang, '
    || 'har qanday fasad bilan uyg''unlashadi.',
    4050000, 1010000, 11, null,
    array[
      'https://placehold.co/800x1000/6b6b70/f1ece2.png?text=ZH-155+Kulrang'
    ],
    '{"model":"ZH-155","width_cm":96,"height_cm":205,"thickness_cm":7,"material":"Po''lat","finish":"Kulrang mat","lock_type":"Bio-qulf","color":"#6b6b70"}'::jsonb,
    false, true
  )
on conflict (id) do nothing;
