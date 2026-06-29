import type { Door, FinishOption } from "@/lib/types";

/**
 * Finish swatches (design 05). Renders the door's available finishes as gold-
 * ringed colour swatches. Uses `specs.finishes` when present, otherwise
 * synthesizes a single swatch from `finish` + `color`. Display-only: a door
 * maps to one .glb, so this showcases the finish rather than swapping models.
 */
export function FinishSwatches({ door }: { door: Door }) {
  const raw = door.specs?.finishes;
  const list: FinishOption[] =
    Array.isArray(raw) && raw.length > 0
      ? raw
      : door.specs?.finish || door.specs?.color
        ? [
            {
              name: String(door.specs?.finish ?? "Standart"),
              color: String(door.specs?.color ?? "#3f3f46"),
            },
          ]
        : [];

  if (list.length === 0) return null;

  const activeName = String(door.specs?.finish ?? list[0].name);

  return (
    <section className="rounded-2xl border border-line bg-panel-2 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-cream">Qoplama</h3>
        <span className="text-xs text-muted">{activeName}</span>
      </div>
      <div className="mt-3.5 flex flex-wrap gap-3.5">
        {list.map((f, i) => {
          const active = f.name === activeName || (i === 0 && !list.some((x) => x.name === activeName));
          return (
            <div key={`${f.name}-${i}`} className="flex flex-col items-center gap-2">
              <span
                className="h-12 w-12 rounded-xl"
                style={{
                  background: f.color,
                  boxShadow: active
                    ? "0 0 0 2px #C6A15B, 0 0 0 5px rgba(198,161,91,0.22)"
                    : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              />
              <span className="text-[10px] text-muted-2">{f.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
