"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { updateAppBadge } from "@/lib/app-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminAccountMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = user?.displayName || user?.phone || "Tài khoản";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if ("serviceWorker" in navigator) {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) =>
            window.setTimeout(() => resolve(null), 1_500),
          ),
        ]);
        if (registration) {
          const subscription = await Promise.race([
            registration.pushManager.getSubscription(),
            new Promise<null>((resolve) =>
              window.setTimeout(() => resolve(null), 1_500),
            ),
          ]);
          if (subscription) {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 1_500);
            try {
              const response = await fetch(
                "/api/admin/push-subscriptions/current",
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ endpoint: subscription.endpoint }),
                  signal: controller.signal,
                },
              );
              if (response.ok) await subscription.unsubscribe();
            } finally {
              window.clearTimeout(timeoutId);
            }
          }
        }
      }
    } catch {
      // Logout must continue even when Push cleanup is unavailable.
    } finally {
      await logout();
      await updateAppBadge(0);
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="adminAccount"
            className="max-w-[min(52vw,220px)] rounded-lg border border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <UserRound className="size-4 text-primary" />
            </span>
            <span className="hidden max-w-36 truncate sm:block">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-slate-900">
              {displayName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <ShieldCheck className="size-3.5 text-primary" />
              {user?.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/admin/profile")}>
            <UserRound className="size-4" />
            Thông tin cá nhân
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLoggingOut}
            onSelect={(event) => {
              event.preventDefault();
              void handleLogout();
            }}
            className="text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
