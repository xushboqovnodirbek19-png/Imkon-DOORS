import { LOW_STOCK_THRESHOLD } from "@/lib/types";

/** "Limited stock" / "out of stock" badge driven by stock_count (§6.1). */
export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="eyebrow rounded-full bg-line px-2 py-1 text-muted">
        Tugagan
      </span>
    );
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="eyebrow rounded-full border border-gold/40 bg-gold/10 px-2 py-1 text-gold-bright">
        Kam qoldi · {stock} dona
      </span>
    );
  }
  return null;
}
