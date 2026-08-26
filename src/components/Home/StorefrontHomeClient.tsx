"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/Auth/AuthProvider";
import { getDefaultRouteByRole, isAdminRole } from "@/lib/auth/routing";
import { Loader2, LogOut, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StorefrontHomeClient() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userRole = user?.role;

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !isAdminRole(userRole)) {
      return;
    }

    router.replace(getDefaultRouteByRole(userRole));
  }, [isAuthenticated, isInitializing, router, userRole]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isInitializing || (isAuthenticated && isAdminRole(userRole))) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCFA] px-4">
        <Loader2 className="size-6 animate-spin text-[#D96C8A]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCFA] text-[#1C1A1B]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 cursor-pointer items-center gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-[#E9E2E5] bg-white shadow-[0_8px_24px_rgba(28,26,27,0.08)]">
              <Image
                src="/logo-quynh-nhi-store-mark.svg"
                alt="Quỳnh Nhi Store"
                width={54}
                height={54}
                className="size-12 object-contain"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-extrabold sm:text-lg">
                Quỳnh Nhi Store
              </span>
              <span className="block truncate text-sm font-semibold text-[#7A7376]">
                Thời trang nhẹ nhàng mỗi ngày
              </span>
            </span>
          </Link>

          {isAuthenticated ? (
            <Button
              type="button"
              variant="dangerSoft"
              size="lg"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              Đăng xuất
            </Button>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild variant="authTab" size="lg">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild variant="brand" size="lg">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </header>

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFF3F6] px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#7A2944]">
              <Sparkles className="size-4 text-[#D96C8A]" />
              Quỳnh Nhi Store
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-[#1C1A1B] sm:text-5xl">
              Mua sắm thời trang nhẹ nhàng, tinh tế và dễ dàng hơn mỗi ngày.
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[#6F686B] sm:text-lg">
              {isAuthenticated
                ? `Chào ${user?.displayName || "bạn"}, tài khoản của bạn đã sẵn sàng để tiếp tục mua sắm.`
                : "Đăng nhập hoặc tạo tài khoản để lưu thông tin, theo dõi đơn hàng và nhận ưu đãi phù hợp."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button asChild variant="brand" size="lg">
                  <Link href="/">
                    <ShoppingBag className="size-4" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="brand" size="lg">
                    <Link href="/login">
                      <UserRound className="size-4" />
                      Đăng nhập tài khoản
                    </Link>
                  </Button>
                  <Button asChild variant="authTab" size="lg">
                    <Link href="/register">Tạo tài khoản mới</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative flex aspect-square w-full max-w-90 items-center justify-center rounded-full bg-[#FFF3F6] shadow-[0_30px_80px_rgba(122,41,68,0.14)]">
              <div className="flex size-[78%] items-center justify-center rounded-full border border-[#E9C9D3] bg-white">
                <Image
                  src="/logo-quynh-nhi-store.svg"
                  alt="Logo Quỳnh Nhi Store"
                  width={300}
                  height={300}
                  className="size-[82%] object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
