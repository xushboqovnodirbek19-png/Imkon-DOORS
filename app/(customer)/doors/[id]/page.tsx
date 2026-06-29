import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoorById } from "@/lib/doors";
import { groupUzs } from "@/lib/format";
import { StockBadge } from "@/app/components/StockBadge";
import { ReserveButton } from "@/app/components/ReserveButton";
import { DoorGallery } from "@/app/components/DoorGallery";
import { FinishSwatches } from "@/app/components/FinishSwatches";
import { DoorViewerLazy } from "@/app/components/three/DoorViewerLazy";

export const runtime = "nodejs";

/** Uzbek labels for known spec keys; unknown keys fall back to the raw key. */
const SPEC_LABELS: Record<string, string> = {
  width_cm: "Eni",
  height_cm: "Bo'yi",
  thickness_cm: "Qalinligi",
  material: "Material",
  finish: "Qoplama",
  lock_type: "Qulf turi",
  color: "Rang",
};

function specValue(key: string, value: unknown): string {
  if (key.endsWith("_cm")) return `${value} sm`;
  return String(value);
}

export default async function DoorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const door = await getDoorById(id);
  if (!door) notFound();

  const specEntries = Object.entries(door.specs ?? {}).filter(
    ([k, v]) => k !== "color" && v !== undefined && v !== "",
  );

  return (
    <div className="pb-44">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur">
        <Link
          href="/"
          aria-label="Orqaga"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cream-dim"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="line-clamp-1 font-display text-base font-semibold">
          {door.name}
        </h1>
      </header>

      <div className="space-y-6 p-4">
        <DoorViewerLazy door={door} />

        <DoorGallery images={door.image_urls} />

        <FinishSwatches door={door} />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {door.category && (
              <span className="eyebrow text-gold/80">{door.category}</span>
            )}
            <StockBadge stock={door.stock_count} />
          </div>
          <h2 className="font-display text-2xl font-bold text-cream">
            {door.name}
          </h2>
          <p className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-gold-bright">
              {groupUzs(door.price)}
            </span>
            <span className="text-sm text-muted">soʻm</span>
          </p>
        </div>

        {door.description && (
          <p className="text-sm leading-relaxed text-cream-dim">
            {door.description}
          </p>
        )}

        {specEntries.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-0.5 bg-gold" />
              <h3 className="eyebrow text-cream-dim">Texnik xususiyatlar</h3>
            </div>
            <dl className="overflow-hidden rounded-2xl border border-line">
              {specEntries.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex justify-between px-4 py-3 text-sm ${
                    i % 2 ? "bg-panel-2" : "bg-panel"
                  }`}
                >
                  <dt className="text-muted">{SPEC_LABELS[k] ?? k}</dt>
                  <dd className="font-medium text-cream">{specValue(k, v)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      <ReserveButton
        deposit={door.deposit_amount}
        price={door.price}
        inStock={door.stock_count > 0}
      />
    </div>
  );
}
