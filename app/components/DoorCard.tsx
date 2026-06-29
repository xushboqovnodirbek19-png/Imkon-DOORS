"use client";

import { useState } from "react";
import Link from "next/link";
import type { Door } from "@/lib/types";
import { groupUzs } from "@/lib/format";
import { StockBadge } from "./StockBadge";

/** Catalog card: thumbnail, name, price, limited-stock badge, key specs. */
export function DoorCard({ door, compact = false }: { door: Door; compact?: boolean }) {
  const thumb = firstImage(door.image_urls);
  // If the photo URL is missing OR fails to load (e.g. an external placeholder
  // host is blocked/unreachable), fall back to a door-tinted placeholder so the
  // card always shows a product visual — the same idea as the detail screen's
  // procedural door — instead of looking empty.
  const [imgOk, setImgOk] = useState(true);
  const tint = doorColor(door);

  return (
    <Link
      href={`/doors/${door.id}`}
      className={`group block overflow-hidden rounded-2xl border border-line bg-panel-gradient transition active:scale-[0.99] ${
        compact ? "w-44 shrink-0" : ""
      }`}
    >
      <div className="relative aspect-[4/5] bg-panel-2">
        {thumb && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={door.name}
            loading="eager"
            decoding="async"
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(165deg, ${tint}33, #15120d 70%)`,
            }}
          >
            <DoorPreview color={tint} />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <StockBadge stock={door.stock_count} />
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        {door.category && (
          <p className="eyebrow text-gold/80">{door.category}</p>
        )}
        <h3 className="line-clamp-1 font-display text-sm font-semibold text-cream">
          {door.name}
        </h3>
        <p className="pt-0.5">
          <span className="font-mono text-sm font-bold text-cream">
            {groupUzs(door.price)}
          </span>{" "}
          <span className="text-[11px] text-muted">soʻm</span>
        </p>
      </div>
    </Link>
  );
}

/**
 * Resolve the card thumbnail — the same first photo the detail page shows.
 * `image_urls` normally arrives as a JS array, but guard against a Postgres
 * array literal ("{url1,url2}") slipping through so the card never silently
 * renders nothing. Returns the first usable http(s) or root-relative URL.
 */
function firstImage(urls: unknown): string | undefined {
  const list: unknown[] = Array.isArray(urls)
    ? urls
    : typeof urls === "string"
      ? urls.replace(/^\{|\}$/g, "").split(",")
      : [];
  for (const raw of list) {
    const url = String(raw).trim().replace(/^"|"$/g, "");
    if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  }
  return undefined;
}

/** A valid hex color for the placeholder door, from the door's spec. */
function doorColor(door: Door): string {
  const c = door.specs?.color;
  return typeof c === "string" && /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : "#3f3f46";
}

/** Filled door silhouette tinted with the door's color (no network needed). */
function DoorPreview({ color }: { color: string }) {
  return (
    <svg width="60" height="86" viewBox="0 0 38 54" fill="none" aria-hidden>
      <rect x="2" y="2" width="34" height="50" rx="4" fill={color} stroke="#6F6658" strokeWidth="1.5" />
      <rect x="9" y="12" width="11" height="22" rx="2" stroke="rgba(241,236,226,0.28)" strokeWidth="1.5" />
      <rect x="17" y="24" width="2.4" height="6" rx="1.2" fill="#C6A15B" />
    </svg>
  );
}
