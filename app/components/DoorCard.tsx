import Link from "next/link";
import type { Door } from "@/lib/types";
import { groupUzs } from "@/lib/format";
import { StockBadge } from "./StockBadge";

/** Catalog card: thumbnail, name, price, limited-stock badge, key specs. */
export function DoorCard({ door, compact = false }: { door: Door; compact?: boolean }) {
  const thumb = firstImage(door.image_urls);

  return (
    <Link
      href={`/doors/${door.id}`}
      className={`group block overflow-hidden rounded-2xl border border-line bg-panel-gradient transition active:scale-[0.99] ${
        compact ? "w-44 shrink-0" : ""
      }`}
    >
      <div className="relative aspect-[4/5] bg-panel-2">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={door.name}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-2">
            <DoorGlyph />
            <span className="eyebrow text-muted-2">Mahsulot foto</span>
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
function firstImage(urls: Door["image_urls"]): string | undefined {
  const list = Array.isArray(urls)
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

function DoorGlyph() {
  return (
    <svg width="38" height="54" viewBox="0 0 38 54" fill="none">
      <rect x="2" y="2" width="34" height="50" rx="4" stroke="#6F6658" strokeWidth="2" />
      <rect x="9" y="12" width="11" height="22" rx="2" stroke="#6F6658" strokeWidth="1.5" />
      <rect x="17" y="24" width="2.4" height="6" rx="1.2" fill="#C6A15B" />
    </svg>
  );
}
