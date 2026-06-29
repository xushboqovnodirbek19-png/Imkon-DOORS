"use client";

import { useEffect, useMemo, useState } from "react";
import type { Door } from "@/lib/types";
import { formatUzs } from "@/lib/format";
import { DoorCard } from "./DoorCard";

/**
 * Home catalog (§6.1). Fetches the active catalog once and filters/searches
 * client-side for instant, lag-free response on a mid-range phone.
 */
export function CatalogBrowser() {
  const [doors, setDoors] = useState<Door[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [finish, setFinish] = useState<string | null>(null);
  const [lockType, setLockType] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/doors")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "xato");
        if (!cancelled) setDoors(data.doors as Door[]);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "xato");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const facets = useMemo(() => {
    const cats = new Set<string>();
    const fins = new Set<string>();
    const locks = new Set<string>();
    let max = 0;
    for (const d of doors ?? []) {
      if (d.category) cats.add(d.category);
      if (d.specs?.finish) fins.add(String(d.specs.finish));
      if (d.specs?.lock_type) locks.add(String(d.specs.lock_type));
      if (d.price > max) max = d.price;
    }
    return {
      categories: [...cats].sort(),
      finishes: [...fins].sort(),
      lockTypes: [...locks].sort(),
      priceMax: max,
    };
  }, [doors]);

  const featured = useMemo(
    () => (doors ?? []).filter((d) => d.is_featured),
    [doors],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (doors ?? []).filter((d) => {
      if (needle && !d.name.toLowerCase().includes(needle)) return false;
      if (category && d.category !== category) return false;
      if (finish && String(d.specs?.finish ?? "") !== finish) return false;
      if (lockType && String(d.specs?.lock_type ?? "") !== lockType) return false;
      if (priceMax !== null && d.price > priceMax) return false;
      return true;
    });
  }, [doors, q, category, finish, lockType, priceMax]);

  const activeFilterCount =
    (category ? 1 : 0) + (finish ? 1 : 0) + (lockType ? 1 : 0) + (priceMax !== null ? 1 : 0);

  return (
    <div>
      {/* Branding + search header */}
      <header className="sticky top-0 z-30 space-y-3 border-b border-line bg-ink/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <div className="leading-none">
              <p className="font-mono text-sm font-bold tracking-[0.2em] text-cream">
                IMKON
              </p>
              <p className="eyebrow text-gold/70">Doors</p>
            </div>
          </div>
          <button
            aria-label="Bildirishnomalar"
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cream-dim"
          >
            <BellIcon />
          </button>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2">
            <SearchIcon />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Eshik qidirish..."
            className="w-full rounded-xl border border-line bg-panel py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-muted-2 outline-none focus:border-gold/50"
          />
        </div>

        {/* Category chips */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            Barchasi
          </Chip>
          {facets.categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-cream-dim"
          >
            Filtrlar{activeFilterCount ? ` · ${activeFilterCount}` : ""}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 rounded-xl border border-line bg-panel p-3">
            <FilterSelect label="Qoplama" value={finish} options={facets.finishes} onChange={setFinish} />
            <FilterSelect label="Qulf turi" value={lockType} options={facets.lockTypes} onChange={setLockType} />
            {facets.priceMax > 0 && (
              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="eyebrow text-muted">Maksimal narx</span>
                  <span className="font-mono text-xs text-cream">
                    {priceMax !== null ? formatUzs(priceMax) : "Cheksiz"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={facets.priceMax}
                  step={100000}
                  value={priceMax ?? facets.priceMax}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPriceMax(v >= facets.priceMax ? null : v);
                  }}
                  className="w-full accent-gold"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setFinish(null);
                setLockType(null);
                setPriceMax(null);
                setCategory(null);
              }}
              className="eyebrow text-gold/80 underline"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </header>

      {error && (
        <p className="m-4 rounded-xl border border-line bg-panel p-3 text-sm text-red-300">
          Katalogni yuklab bo&apos;lmadi: {error}
        </p>
      )}

      {doors === null && !error && (
        <div className="grid grid-cols-2 gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-panel" />
          ))}
        </div>
      )}

      {doors && (
        <div className="space-y-7 px-4 py-5">
          {/* Top products */}
          {featured.length > 0 && q === "" && activeFilterCount === 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-0.5 bg-gold" />
                <h2 className="eyebrow text-cream-dim">Tanlangan</h2>
              </div>
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                {featured.map((d) => (
                  <DoorCard key={d.id} door={d} compact />
                ))}
              </div>
            </section>
          )}

          {/* All products */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-0.5 bg-gold" />
              <h2 className="eyebrow text-cream-dim">Barcha eshiklar</h2>
              <span className="font-mono text-[11px] text-muted-2">
                {filtered.length}
              </span>
            </div>
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">
                Hech narsa topilmadi.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((d) => (
                  <DoorCard key={d.id} door={d} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-gold-gradient text-ink shadow-gold"
          : "border border-line bg-panel text-cream-dim"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <label className="block">
      <span className="eyebrow mb-1 block text-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-line bg-panel-2 px-2.5 py-2 text-sm text-cream"
      >
        <option value="">Barchasi</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-panel">
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
        <rect x="1" y="1" width="14" height="20" rx="2" stroke="#C6A15B" strokeWidth="1.5" />
        <rect x="5" y="6" width="6" height="10" rx="1" stroke="#C6A15B" strokeWidth="1" />
        <rect x="9.4" y="10" width="1.4" height="3.2" rx="0.7" fill="#D8B774" />
      </svg>
    </span>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
