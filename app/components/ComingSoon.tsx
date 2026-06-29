/** Shared placeholder for tabs that arrive in later phases. */
export function ComingSoon({
  icon,
  title,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-panel text-gold">
        {icon}
      </div>
      <h1 className="font-display text-lg font-semibold text-cream">{title}</h1>
      <p className="text-sm text-muted">{note}</p>
      <span className="eyebrow rounded-full border border-line bg-panel px-3 py-1 text-muted-2">
        Tez kunda
      </span>
    </div>
  );
}
