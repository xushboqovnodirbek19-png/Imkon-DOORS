/**
 * Gallery thumbnail strip with a "+N" overflow chip (design 04). Shows the
 * door's fallback photos beneath the 3D viewer; if there are more than fit, the
 * last cell becomes a Space-Mono gold "+N" count.
 */
export function DoorGallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  const MAX = 5;
  const overflow = images.length > MAX;
  const visible = overflow ? images.slice(0, MAX - 1) : images;
  const extra = overflow ? images.length - (MAX - 1) : 0;

  return (
    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
      {visible.map((url, i) => (
        <div
          key={i}
          className="h-[60px] w-[54px] shrink-0 overflow-hidden rounded-[10px] border border-line bg-panel-gradient"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-[60px] w-[54px] shrink-0 items-center justify-center rounded-[10px] border border-line bg-panel font-mono text-[11px] font-bold text-gold">
          +{extra}
        </div>
      )}
    </div>
  );
}
