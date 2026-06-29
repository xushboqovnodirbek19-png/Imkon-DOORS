/**
 * Tiered deposit calculation (spec §9).
 *
 * NOTE (Phase 1): the spec's tier bands are expressed in USD, but `price` is
 * stored in UZS. We convert with a provisional rate so admins get a sensible
 * auto-suggested deposit. The exact bands + rate basis are an open decision
 * (§15) to be confirmed before Phase 3 wires this into checkout.
 */

/** Provisional USD→UZS rate used only to bucket prices into the tiers. */
export const PROVISIONAL_USD_UZS = 12600;

interface Tier {
  maxUsd: number; // inclusive upper bound; Infinity for the top band
  rate: number; // deposit fraction
}

const TIERS: Tier[] = [
  { maxUsd: 100, rate: 0.3 },
  { maxUsd: 250, rate: 0.25 },
  { maxUsd: 500, rate: 0.2 },
  { maxUsd: 1000, rate: 0.15 },
  { maxUsd: Infinity, rate: 0.1 },
];

/** Suggested deposit in UZS for a door priced in UZS. */
export function suggestDeposit(
  priceUzs: number,
  usdRate: number = PROVISIONAL_USD_UZS,
): number {
  const priceUsd = priceUzs / usdRate;
  const tier = TIERS.find((t) => priceUsd <= t.maxUsd) ?? TIERS[TIERS.length - 1];
  // Round to the nearest 1000 so'm for a clean figure.
  return Math.round((priceUzs * tier.rate) / 1000) * 1000;
}
