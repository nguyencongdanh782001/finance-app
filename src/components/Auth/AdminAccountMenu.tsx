"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/ui/button";
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
    await logout();
    router.replace("/login");
  };

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50 sm:right-5 sm:top-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="adminAccount"
            size="adminAccount"
            className="pointer-events-auto max-w-[calc(100vw-24px)] rounded-full"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF3F6]">
              <UserRound className="size-4 text-[#D96C8A]" />
            </span>
            <span className="hidden max-w-36 truncate sm:block">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-extrabold text-[#1C1A1B]">
              {displayName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#6F686B]">
              <ShieldCheck className="size-3.5 text-[#D96C8A]" />
              {user?.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoggingOut}
            onSelect={(event) => {
              event.preventDefault();
              void handleLogout();
            }}
            className="text-[#A43E5F] focus:bg-[#FFF3F6] focus:text-[#7A2944]"
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
