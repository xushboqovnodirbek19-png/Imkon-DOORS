/** Shared domain types for the IMKON Doors catalog. */

export interface FinishOption {
  name: string; // e.g. "Yong'oq"
  color: string; // hex swatch
}

export interface DoorSpecs {
  /** Free-form spec map shown on the detail screen. Common keys below. */
  width_cm?: number;
  height_cm?: number;
  thickness_cm?: number;
  material?: string; // e.g. "Po'lat" (steel)
  finish?: string; // e.g. "Matt qora" (the active finish)
  lock_type?: string; // e.g. "Bio-qulf"
  color?: string; // hex or name, used by the procedural door
  finishes?: FinishOption[]; // optional showroom finish swatches (§7 design 05)
  [key: string]:
    | string
    | number
    | boolean
    | FinishOption[]
    | undefined;
}

export interface Door {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  deposit_amount: number;
  stock_count: number;
  model_3d_url: string | null;
  image_urls: string[];
  specs: DoorSpecs;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DoorFilters {
  q?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  finish?: string;
  lockType?: string;
  featured?: boolean;
}

/** Below this many in stock we show a "limited stock" badge. */
export const LOW_STOCK_THRESHOLD = 5;
