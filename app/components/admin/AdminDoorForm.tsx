"use client";

import { useState } from "react";
import type { Door } from "@/lib/types";
import { suggestDeposit } from "@/lib/deposit";

/** Create/edit a door, including .glb + image uploads to Supabase Storage. */
export function AdminDoorForm({
  door,
  onSaved,
  onCancel,
}: {
  door: Door | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const s = door?.specs ?? {};
  const [name, setName] = useState(door?.name ?? "");
  const [category, setCategory] = useState(door?.category ?? "entry");
  const [description, setDescription] = useState(door?.description ?? "");
  const [price, setPrice] = useState(String(door?.price ?? ""));
  const [deposit, setDeposit] = useState(String(door?.deposit_amount ?? ""));
  const [stock, setStock] = useState(String(door?.stock_count ?? "0"));
  const [isFeatured, setIsFeatured] = useState(door?.is_featured ?? false);
  const [isActive, setIsActive] = useState(door?.is_active ?? true);

  const [width, setWidth] = useState(str(s.width_cm));
  const [height, setHeight] = useState(str(s.height_cm));
  const [thickness, setThickness] = useState(str(s.thickness_cm));
  const [material, setMaterial] = useState(str(s.material));
  const [finish, setFinish] = useState(str(s.finish));
  const [lockType, setLockType] = useState(str(s.lock_type));
  const [color, setColor] = useState(str(s.color) || "#3f3f46");

  const [images, setImages] = useState<string[]>(door?.image_urls ?? []);
  const [modelUrl, setModelUrl] = useState(door?.model_3d_url ?? "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, kind: "model" | "image") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "yuklash xatosi");
    return d.url as string;
  }

  async function onImagePick(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await upload(f, "image"));
      setImages((prev) => [...prev, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "yuklash xatosi");
    } finally {
      setBusy(false);
    }
  }

  async function onModelPick(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      setModelUrl(await upload(files[0], "model"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "yuklash xatosi");
    } finally {
      setBusy(false);
    }
  }

  function buildSpecs() {
    const specs: Record<string, string | number> = {};
    if (width) specs.width_cm = Number(width);
    if (height) specs.height_cm = Number(height);
    if (thickness) specs.thickness_cm = Number(thickness);
    if (material) specs.material = material;
    if (finish) specs.finish = finish;
    if (lockType) specs.lock_type = lockType;
    if (color) specs.color = color;
    return specs;
  }

  async function save() {
    setError(null);
    if (!name.trim()) {
      setError("Nom kiritilishi shart");
      return;
    }
    setBusy(true);
    try {
      const body = {
        name: name.trim(),
        category,
        description,
        price: Number(price) || 0,
        deposit_amount: Number(deposit) || 0,
        stock_count: Number(stock) || 0,
        model_3d_url: modelUrl || null,
        image_urls: images,
        specs: buildSpecs(),
        is_featured: isFeatured,
        is_active: isActive,
      };
      const url = door ? `/api/admin/doors/${door.id}` : "/api/admin/doors";
      const r = await fetch(url, {
        method: door ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "saqlash xatosi");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "saqlash xatosi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-ink p-4">
      <header className="mb-5 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cream-dim"
        >
          ←
        </button>
        <h1 className="font-display text-lg font-semibold text-cream">
          {door ? "Eshikni tahrirlash" : "Yangi eshik"}
        </h1>
      </header>

      <div className="space-y-3">
        <Field label="Nomi">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Kategoriya">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="entry">entry — kirish eshigi</option>
            <option value="security">security — xavfsizlik</option>
            <option value="interior">interior — ichki</option>
          </select>
        </Field>

        <Field label="Tavsif">
          <textarea
            className={inputCls}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Narx (UZS)">
            <input className={inputCls} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Depozit (UZS)">
            <div className="flex gap-1">
              <input className={inputCls} inputMode="numeric" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              <button
                type="button"
                onClick={() => setDeposit(String(suggestDeposit(Number(price) || 0)))}
                className="shrink-0 rounded-lg border border-gold/40 px-2 text-xs text-gold"
                title="Tier bo'yicha taklif"
              >
                Auto
              </button>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Zaxira (dona)">
            <input className={inputCls} inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
          </Field>
          <Field label="Eni (sm)">
            <input className={inputCls} inputMode="numeric" value={width} onChange={(e) => setWidth(e.target.value)} />
          </Field>
          <Field label="Bo'yi (sm)">
            <input className={inputCls} inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Qalinlik (sm)">
            <input className={inputCls} inputMode="numeric" value={thickness} onChange={(e) => setThickness(e.target.value)} />
          </Field>
          <Field label="Material">
            <input className={inputCls} value={material} onChange={(e) => setMaterial(e.target.value)} />
          </Field>
          <Field label="Qoplama">
            <input className={inputCls} value={finish} onChange={(e) => setFinish(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Qulf turi">
            <input className={inputCls} value={lockType} onChange={(e) => setLockType(e.target.value)} />
          </Field>
          <Field label="Rang (3D)">
            <input type="color" className="h-10 w-full rounded-lg border border-line bg-panel" value={color} onChange={(e) => setColor(e.target.value)} />
          </Field>
        </div>

        {/* Images */}
        <div>
          <p className="eyebrow mb-1.5 text-muted">Rasmlar (fallback)</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((u) => u !== url))}
                  className="absolute right-0 top-0 bg-black/70 px-1 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={(e) => onImagePick(e.target.files)} className="text-xs text-muted" />
        </div>

        {/* 3D model */}
        <div>
          <p className="eyebrow mb-1.5 text-muted">3D model (.glb)</p>
          {modelUrl ? (
            <p className="mb-1 flex items-center gap-2 text-xs text-success">
              ✓ Model yuklandi
              <button type="button" onClick={() => setModelUrl("")} className="text-red-300 underline">
                o&apos;chirish
              </button>
            </p>
          ) : (
            <p className="mb-1 text-xs text-muted-2">
              Bo&apos;sh — protsedura eshigi ko&apos;rsatiladi.
            </p>
          )}
          <input type="file" accept=".glb" onChange={(e) => onModelPick(e.target.files)} className="text-xs text-muted" />
        </div>

        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-cream-dim">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-gold" />
            Top mahsulot
          </label>
          <label className="flex items-center gap-2 text-sm text-cream-dim">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-gold" />
            Faol
          </label>
        </div>

        {error && <p className="rounded-lg border border-line bg-panel p-3 text-sm text-red-300">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-line py-2.5 text-sm text-cream-dim">
            Bekor qilish
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="flex-1 rounded-xl bg-gold-gradient py-2.5 text-sm font-bold text-ink shadow-gold disabled:opacity-40 disabled:shadow-none"
          >
            {busy ? "Saqlanmoqda…" : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-cream outline-none focus:border-gold/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}

function str(v: unknown): string {
  return v === undefined || v === null ? "" : String(v);
}
