import AdminAuthGuard from "@/components/Auth/AdminAuthGuard";
import AdminShell from "@/components/Admin/AdminShell";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
