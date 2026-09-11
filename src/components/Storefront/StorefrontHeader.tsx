"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useCart } from "@/components/Storefront/CartProvider";
import ProductSearch from "@/components/Storefront/ProductSearch";
import { FavoriteChangedDetail } from "@/components/Storefront/ProductFavoriteButton";
import { storefrontGenderLinks } from "@/components/Storefront/storefront-navigation";
import { getStorefrontContent } from "@/components/Storefront/storefront-content-cache";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { getDefaultRouteByRole, isAdminRole } from "@/lib/auth/routing";
import { Heart, LogOut, Menu, ShoppingBag, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const badge = (value: number) => (value > 99 ? "99+" : value);

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [announcement, setAnnouncement] = useState(
    "Miễn phí vận chuyển cho đơn hàng từ 499.000đ",
  );
  const accountRef = useRef<HTMLDivElement>(null);
  const customer = Boolean(isAuthenticated && user && !isAdminRole(user.role));

  useEffect(() => {
    getStorefrontContent("homepage", () =>
      fetch("/api/homepage").then((response) =>
        response.ok ? response.json() : Promise.reject(),
      ),
    )
      .then(
        (data: {
          announcement?: {
            title?: string | null;
            description?: string | null;
          } | null;
        }) => {
          const item = data.announcement;
          if (item?.title) {
            setAnnouncement(
              item.description
                ? `${item.title} · ${item.description}`
                : item.title,
            );
          }
        },
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!customer) {
      setFavoriteCount(0);
      return;
    }
    fetch("/api/me/favorites?limit=1")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { total?: number }) =>
        setFavoriteCount(Number(data.total || 0)),
      )
      .catch(() => undefined);
  }, [customer]);

  useEffect(() => {
    const onFavorite = (event: Event) => {
      const detail = (event as CustomEvent<FavoriteChangedDetail>).detail;
      setFavoriteCount((value) =>
        Math.max(0, value + (detail.isFavorited ? 1 : -1)),
      );
    };
    window.addEventListener("storefront:favorite-changed", onFavorite);
    return () =>
      window.removeEventListener("storefront:favorite-changed", onFavorite);
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const active = (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    const targetGender = new URLSearchParams(query).get("gender");
    return targetGender
      ? searchParams.get("gender") === targetGender
      : !searchParams.get("gender");
  };
  const accountHref =
    isAuthenticated && user
      ? isAdminRole(user.role)
        ? getDefaultRouteByRole(user.role)
        : "/account"
      : `/login?redirect=${encodeURIComponent(pathname)}`;
  const doLogout = async () => {
    await logout();
    setMenuOpen(false);
    setAccountOpen(false);
    router.push("/");
  };

  return (
    <>
      <div className="bg-[#2F2529] px-4 py-2 text-center text-[11px] font-bold tracking-wide text-white sm:text-xs">
        {announcement}
      </div>
      <header className="sticky top-0 z-40 border-b border-[#EAE1E4] bg-[#FAF8F8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-start gap-2 px-3 sm:h-[68px] sm:px-6 lg:justify-between lg:gap-8 lg:px-8">
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Mở menu"
              onClick={() => setMenuOpen(true)}
              className="flex size-11 items-center justify-center text-[#6F6066] hover:text-[#D96C8A] lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <Link
              href="/"
              aria-label="Quỳnh Nhi Store"
              className="flex h-11 w-[130px] items-center sm:w-[160px] lg:w-[174px]"
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
          </div>
          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="Danh mục chính"
          >
            {storefrontGenderLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-6 text-sm font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#D96C8A] ${active(link.href) ? "text-[#A43E5F] after:scale-x-100" : "text-[#6F6066] after:scale-x-0 hover:text-[#A43E5F] hover:after:scale-x-100"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:ml-0 lg:contents">
            <ProductSearch />
            <div className="flex items-center gap-0.5">
              <div ref={accountRef} className="relative hidden lg:block">
                <button
                  type="button"
                  aria-label="Tài khoản"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((value) => !value)}
                  className="flex size-11 items-center justify-center text-[#6F6066] hover:text-[#D96C8A]"
                >
                  <UserRound className="size-5" />
                </button>
                {accountOpen && (
                  <div className="absolute right-[-0.35rem] top-[calc(100%+0.85rem)] z-50 w-64 overflow-hidden rounded-[22px] border border-[#EAE1E4] bg-[#FFFDFC] p-2 shadow-[0_18px_45px_rgba(77,47,58,0.14)] before:absolute before:right-5 before:top-[-7px] before:size-3 before:rotate-45 before:border-l before:border-t before:border-[#EAE1E4] before:bg-[#FFFDFC]">
                    <div className="relative z-10 flex items-center gap-3 rounded-[16px] bg-[#FFF3F6] px-3.5 py-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#A43E5F]">
                        {(user?.displayName || "KH")
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(-2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#3B2D32]">
                          {user?.displayName || "Tài khoản của tôi"}
                        </p>
                        <p className="mt-0.5 text-xs text-[#A43E5F]">
                          Quản lý tài khoản
                        </p>
                      </div>
                    </div>
                    <Link
                      href={accountHref}
                      onClick={() => setAccountOpen(false)}
                      className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#3B2D32] transition-colors hover:bg-[#FCEEF3] hover:text-[#A43E5F] focus-visible:bg-[#FCEEF3] focus-visible:outline-none"
                    >
                      <UserRound className="size-4 text-[#D96C8A]" />
                      {isAdminRole(user?.role)
                        ? "Khu vực quản trị"
                        : "Tài khoản của tôi"}
                    </Link>
                    {customer && (
                      <>
                        <Link
                          href="/account/favorites"
                          onClick={() => setAccountOpen(false)}
                          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#3B2D32] transition-colors hover:bg-[#FCEEF3] hover:text-[#A43E5F] focus-visible:bg-[#FCEEF3] focus-visible:outline-none"
                        >
                          <Heart className="size-4 text-[#D96C8A]" />
                          Sản phẩm yêu thích
                        </Link>
                        <button
                          type="button"
                          onClick={doLogout}
                          className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold text-[#6F6066] transition-colors hover:bg-[#FCEEF3] hover:text-[#A43E5F] focus-visible:bg-[#FCEEF3] focus-visible:outline-none"
                        >
                          <LogOut className="size-4" /> Đăng xuất
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/account/favorites"
                aria-label={`Sản phẩm yêu thích, ${favoriteCount} sản phẩm`}
                className="relative hidden size-11 items-center justify-center text-[#6F6066] hover:text-[#D96C8A] lg:flex"
              >
                <Heart className="size-5" />
                {favoriteCount > 0 && (
                  <span className="absolute right-0 top-0 min-w-4 rounded-full bg-[#D96C8A] px-1 text-center text-[10px] font-bold leading-4 text-white">
                    {badge(favoriteCount)}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                aria-label={`Giỏ hàng, ${count} sản phẩm`}
                className="relative flex size-11 items-center justify-center text-[#6F6066] hover:text-[#D96C8A]"
              >
                <ShoppingBag className="size-5" />
                {count > 0 && (
                  <span className="absolute right-0 top-0 min-w-4 rounded-full bg-[#D96C8A] px-1 text-center text-[10px] font-bold leading-4 text-white">
                    {badge(count)}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden border-t border-[#EAE1E4] lg:block">
          <div className="mx-auto flex max-w-7xl justify-center gap-8 px-8 py-2 text-xs font-semibold text-[#6F6066]">
            <Link href="/products" className="hover:text-[#D96C8A]">
              Tất cả sản phẩm
            </Link>
            <Link href="/membership" className="hover:text-[#D96C8A]">
              Thành viên
            </Link>
          </div>
        </div>
      </header>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-[min(88vw,340px)] bg-[#FAF8F8] p-0"
        >
          <SheetTitle className="border-b border-[#EAE1E4] px-5 py-5 text-left text-lg">
            Menu
          </SheetTitle>
          <SheetDescription className="sr-only">
            Điều hướng cửa hàng
          </SheetDescription>
          <div className="h-[calc(100dvh-73px)] overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <nav className="grid" aria-label="Menu mua sắm">
              {storefrontGenderLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-12 items-center border-b border-[#EAE1E4] text-base font-semibold ${active(link.href) ? "text-[#A43E5F]" : "text-[#2D2226]"}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account/favorites"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center gap-3 border-b border-[#EAE1E4] text-base font-semibold"
              >
                <Heart className="size-4 text-[#D96C8A]" />
                Sản phẩm yêu thích
              </Link>
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center gap-3 border-b border-[#EAE1E4] text-base font-semibold"
              >
                <UserRound className="size-4 text-[#D96C8A]" />
                Tài khoản
              </Link>
              {customer && (
                <button
                  type="button"
                  onClick={doLogout}
                  className="flex min-h-12 items-center gap-3 border-b border-[#EAE1E4] text-left text-base font-semibold"
                >
                  <LogOut className="size-4 text-[#D96C8A]" />
                  Đăng xuất
                </button>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
