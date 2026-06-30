"use client";

import { useEffect, useMemo, useState } from "react";
import type { Door } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/lib/types";
import { formatUzs } from "@/lib/format";

/**
 * Admin overview: at-a-glance catalog health computed from the full door list
 * (active + hidden). Surfaces low/out-of-stock doors as an actionable list.
 */
export function AdminOverview({
  adminCount,
  onManageCatalog,
}: {
  adminCount: number;
  onManageCatalog: () => void;
}) {
  const [doors, setDoors] = useState<Door[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/doors")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "xato");
        if (!cancelled) setDoors(d.doors as Door[]);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "xato");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const list = doors ?? [];
    const active = list.filter((d) => d.is_active);
    const attention = active
      .filter((d) => d.stock_count < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock_count - b.stock_count);
    return {
      total: list.length,
      active: active.length,
      hidden: list.length - active.length,
      featured: list.filter((d) => d.is_featured).length,
      units: list.reduce((s, d) => s + d.stock_count, 0),
      value: list.reduce((s, d) => s + d.price * d.stock_count, 0),
      attention,
    };
  }, [doors]);

  if (error) {
    return (
      <p className="m-4 rounded-xl border border-line bg-panel p-3 text-sm text-red-300">
        Maʼlumotlarni yuklab boʻlmadi: {error}
      </p>
    );
  }

  if (doors === null) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-panel" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <section>
        <SectionLabel>Katalog holati</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Jami eshiklar" value={String(stats.total)} />
          <Stat label="Faol" value={String(stats.active)} accent />
          <Stat label="Tanlangan" value={String(stats.featured)} />
          <Stat label="Yashirin" value={String(stats.hidden)} />
          <Stat label="Jami zaxira" value={`${stats.units} dona`} />
          <Stat label="Adminlar" value={String(adminCount)} />
        </div>
      </section>

      <section>
        <SectionLabel>Katalog qiymati</SectionLabel>
        <div className="rounded-2xl border border-line bg-panel-gradient p-4">
          <p className="font-mono text-2xl font-bold text-gold-bright">
            {formatUzs(stats.value)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Narx × zaxira boʻyicha (faol + yashirin).
          </p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel className="mb-0">Eʼtibor talab qiladi</SectionLabel>
          <button
            onClick={onManageCatalog}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-cream-dim"
          >
            Katalogni boshqarish
          </button>
        </div>
        {stats.attention.length === 0 ? (
          <p className="rounded-xl border border-line bg-panel p-3 text-sm text-success">
            ✓ Barcha faol eshiklarda zaxira yetarli.
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.attention.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-line bg-panel p-3"
              >
                <span className="min-w-0 truncate text-sm text-cream">{d.name}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] ${
                    d.stock_count === 0
                      ? "bg-red-400/15 text-red-300"
                      : "bg-gold/15 text-gold"
                  }`}
                >
                  {d.stock_count === 0 ? "tugagan" : `${d.stock_count} dona`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-center gap-2 ${className}`}>
      <span className="h-3 w-0.5 bg-gold" />
      <h2 className="eyebrow text-cream-dim">{children}</h2>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel-gradient p-4">
      <p
        className={`font-mono text-2xl font-bold ${
          accent ? "text-gold-bright" : "text-cream"
        }`}
      >
        {value}
      </p>
      <p className="eyebrow mt-1 text-muted">{label}</p>
    </div>
  );
}
