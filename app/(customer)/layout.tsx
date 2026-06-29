import { BottomNav } from "@/app/components/BottomNav";

/** Customer shell: every customer tab gets the bottom nav + safe padding. */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-ink pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
