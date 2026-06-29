"use client";

import { useState } from "react";
import { groupUzs } from "@/lib/format";

/**
 * Phase 1 stub for the reserve/cart action. Cart, reservations and the Click
 * deposit flow land in Phase 3 — this shows the tiered deposit + notice and
 * matches the design's pinned CTA bar.
 */
export function ReserveButton({
  deposit,
  price,
  inStock,
}: {
  deposit: number;
  price: number;
  inStock: boolean;
}) {
  const [tapped, setTapped] = useState(false);
  const pct = price > 0 ? Math.round((deposit / price) * 100) : 0;
  const depositStr = groupUzs(deposit);

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md border-t border-line bg-panel-2/95 px-4 pb-3 pt-3 backdrop-blur">
      <p className="mb-2.5 text-xs leading-relaxed text-muted">
        Band qilish uchun{" "}
        <span className="text-cream-dim">{pct}% oldindan toʻlov</span> — qolgani
        doʻkonda. Toʻlov qaytarilmaydi.
      </p>
      <div className="flex items-center gap-3">
        <div className="leading-tight">
          <p className="eyebrow text-muted-2">Oldindan toʻlov</p>
          <p className="font-mono text-base font-bold text-gold-bright">
            {depositStr} <span className="text-[11px] text-muted">soʻm</span>
          </p>
        </div>
        <button
          type="button"
          disabled={!inStock}
          onClick={() => setTapped(true)}
          className="ml-auto flex-1 rounded-xl bg-gold-gradient py-3 text-sm font-bold text-ink shadow-gold disabled:opacity-40 disabled:shadow-none"
        >
          {inStock ? "Band qilish va toʻlov" : "Hozircha mavjud emas"}
        </button>
      </div>
      {tapped && (
        <p className="mt-2 text-center text-[11px] text-gold/70">
          Band qilish va toʻlov keyingi bosqichda (Phase 3) ulanadi.
        </p>
      )}
    </div>
  );
}
