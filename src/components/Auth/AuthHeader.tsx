"use client";

import { Button } from "@/components/ui/button";
import { storefrontGenderLinks } from "@/components/Storefront/storefront-navigation";
import Image from "next/image";
import Link from "next/link";

type AuthHeaderProps = {
  mode?: "login" | "register";
  onModeChange?: (mode: "login" | "register") => void;
};

export default function AuthHeader({ mode, onModeChange }: AuthHeaderProps) {
  return (
    <>
      <div className="bg-[#2F2529] px-4 py-2 text-center text-[11px] font-bold tracking-wide text-white sm:text-xs">
        Miễn phí vận chuyển cho đơn hàng từ 499.000đ
      </div>
      <header className="border-b border-[#EAE1E4] bg-[#FAF8F8]">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[68px] sm:px-6 lg:gap-8 lg:px-8">
          <Link
            href="/"
            aria-label="Quỳnh Nhi Store"
            className="flex h-11 w-[138px] shrink-0 items-center sm:w-[160px] lg:w-[174px]"
          >
            <Image
              src="/logo-quynh-nhi-store.svg"
              alt="Quỳnh Nhi Store"
              width={174}
              height={65}
              priority
              className="h-auto w-full object-contain"
            />
          </Link>

          <nav
            aria-label="Danh mục chính"
            className="hidden items-center gap-6 lg:flex"
          >
            {storefrontGenderLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#6F6066] transition-colors hover:text-[#A43E5F]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {mode && onModeChange ? (
            <div className="grid grid-cols-2 rounded-lg border border-[#EAE1E4] bg-white p-1">
              <Button
                type="button"
                variant={mode === "login" ? "authTabActive" : "authTab"}
                size="authTab"
                onClick={() => onModeChange("login")}
              >
                Đăng nhập
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "authTabActive" : "authTab"}
                size="authTab"
                onClick={() => onModeChange("register")}
              >
                Đăng ký
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-[#D8C6CC] px-3 py-2 text-sm font-bold text-[#7A2944] transition-colors hover:bg-[#FCEEF3] sm:px-4"
            >
              Đăng nhập
            </Link>
          )}
        </div>
        <div className="border-t border-[#EAE1E4] lg:hidden">
          <div className="flex justify-center gap-6 px-4 py-2 text-xs font-semibold text-[#6F6066]">
            <Link href="/products">Sản phẩm</Link>
            <Link href="/products?gender=WOMEN">Nữ</Link>
            <Link href="/products?gender=MEN">Nam</Link>
          </div>
        </div>
      </header>
    </>
  );
}
