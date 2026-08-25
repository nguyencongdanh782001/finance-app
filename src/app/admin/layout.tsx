import AdminAuthGuard from "@/components/Auth/AdminAuthGuard";
import AdminAccountMenu from "@/components/Auth/AdminAccountMenu";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminAccountMenu />
      {children}
    </AdminAuthGuard>
  );
}
