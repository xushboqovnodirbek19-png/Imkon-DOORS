import { redirect } from "next/navigation";
import { getAdminFromCookies, adminAllowlist } from "@/lib/admin/auth";
import { AdminShell } from "@/app/components/admin/AdminShell";

export const runtime = "nodejs";

/** Admin dashboard — guarded server-side by the signed admin session. */
export default async function AdminPage() {
  const adminId = await getAdminFromCookies();
  if (adminId === null) redirect("/admin/login");
  return <AdminShell adminId={adminId} adminCount={adminAllowlist().length} />;
}
