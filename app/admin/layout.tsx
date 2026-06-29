/** Admin shell — plain web dashboard, no customer bottom nav. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto min-h-dvh max-w-3xl">{children}</div>;
}
