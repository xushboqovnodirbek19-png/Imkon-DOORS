import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/admin/auth";
import { AdminDashboard } from "@/app/components/admin/AdminDashboard";

export const runtime = "nodejs";

/** Admin dashboard — guarded server-side by the signed admin session. */
export default async function AdminPage() {
  const adminId = await getAdminFromCookies();
  if (adminId === null) redirect("/admin/login");
  return <AdminDashboard adminId={adminId} />;
}
