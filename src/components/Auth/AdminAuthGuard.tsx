"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { getSafeReturnPath, isAdminRole } from "@/lib/auth/routing";
import { Store } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated || !user) {
      const redirectPath = getSafeReturnPath(
        `${pathname}${window.location.search}`,
      );

      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    if (!isAdminRole(user.role)) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitializing, pathname, router, user]);

  if (isInitializing || !isAuthenticated || !isAdminRole(user?.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <Store className="size-7 text-sky-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">
              Đang kiểm tra đăng nhập
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quỳnh Nhi Store đang mở khu vực quản trị cho bạn.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
