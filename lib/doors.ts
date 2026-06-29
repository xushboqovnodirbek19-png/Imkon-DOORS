import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import type { Door, DoorFilters } from "@/lib/types";

/**
 * Server-side catalog queries. Uses the service-role client and filters to
 * active doors explicitly (we never expose inactive doors to customers).
 */

const DOOR_COLUMNS =
  "id, name, category, description, price, deposit_amount, stock_count, " +
  "model_3d_url, image_urls, specs, is_featured, is_active, created_at";

export async function getActiveDoors(filters: DoorFilters = {}): Promise<Door[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("doors")
    .select(DOOR_COLUMNS)
    .eq("is_active", true);

  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.category) query = query.eq("category", filters.category);
  if (typeof filters.priceMin === "number")
    query = query.gte("price", filters.priceMin);
  if (typeof filters.priceMax === "number")
    query = query.lte("price", filters.priceMax);
  if (filters.q) query = query.ilike("name", `%${filters.q}%`);
  // Spec values live in JSONB; match on the relevant keys when provided.
  if (filters.finish) query = query.eq("specs->>finish", filters.finish);
  if (filters.lockType) query = query.eq("specs->>lock_type", filters.lockType);

  query = query.order("is_featured", { ascending: false }).order("created_at", {
    ascending: false,
  });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Door[];
}

export async function getDoorById(id: string): Promise<Door | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("doors")
    .select(DOOR_COLUMNS)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Door) ?? null;
}

/** Distinct filter values for building the filter row. */
export async function getFilterFacets(): Promise<{
  categories: string[];
  finishes: string[];
  lockTypes: string[];
  priceMax: number;
}> {
  const doors = await getActiveDoors();
  const categories = new Set<string>();
  const finishes = new Set<string>();
  const lockTypes = new Set<string>();
  let priceMax = 0;
  for (const d of doors) {
    if (d.category) categories.add(d.category);
    if (d.specs?.finish) finishes.add(String(d.specs.finish));
    if (d.specs?.lock_type) lockTypes.add(String(d.specs.lock_type));
    if (d.price > priceMax) priceMax = d.price;
  }
  return {
    categories: [...categories].sort(),
    finishes: [...finishes].sort(),
    lockTypes: [...lockTypes].sort(),
    priceMax,
  };
}
