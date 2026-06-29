/** Display formatting helpers (Uzbek locale). */

/**
 * Group a number with spaces as the thousands separator — e.g. 9800000 →
 * "9 800 000". Deterministic on purpose: `Intl.NumberFormat` can emit
 * different separators in Node vs the browser, which causes React hydration
 * mismatches. Manual grouping renders identically everywhere.
 */
export function groupUzs(amount: number): string {
  const n = Math.round(amount);
  const digits = Math.abs(n).toString();
  const parts: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return (n < 0 ? "-" : "") + parts.join(" ");
}

/** Full price string, e.g. "9 800 000 so'm". */
export function formatUzs(amount: number): string {
  return `${groupUzs(amount)} so'm`;
}
