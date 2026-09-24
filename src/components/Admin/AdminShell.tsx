"use client";

import AdminAccountMenu from "@/components/Auth/AdminAccountMenu";
import AdminNotificationCenter from "@/components/Admin/AdminNotificationCenter";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  FolderTree,
  Gift,
  LayoutDashboard,
  Menu,
  Package,
  PackageCheck,
  Percent,
  Star,
  Users,
  Megaphone,
  ScrollText,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

type AdminNavItem = {
  href: string;
  label: string;
  group: string;
  icon: ComponentType<{ className?: string }>;
  matches: (pathname: string) => boolean;
};

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Tổng quan",
    group: "Tổng quan",
    icon: LayoutDashboard,
    matches: (pathname) =>
      pathname === "/admin" ||
      pathname.startsWith("/admin/daily-detail/") ||
      pathname.startsWith("/admin/monthly-detail/"),
  },
  {
    href: "/admin/discounts",
    label: "Mã giảm giá",
    group: "Khách hàng & ưu đãi",
    icon: Percent,
    matches: (pathname) => pathname.startsWith("/admin/discounts"),
  },
  {
    href: "/admin/memberships/benefits",
    label: "Quyền lợi membership",
    group: "Khách hàng & ưu đãi",
    icon: Gift,
    matches: (pathname) =>
      pathname === "/admin/memberships/benefits" ||
      pathname.startsWith("/admin/memberships/benefits/"),
  },
  {
    href: "/admin/memberships",
    label: "Hạng membership",
    group: "Khách hàng & ưu đãi",
    icon: Star,
    matches: (pathname) => pathname === "/admin/memberships",
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    group: "Khách hàng & ưu đãi",
    icon: Users,
    matches: (pathname) => pathname.startsWith("/admin/users"),
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    group: "Quản lý cửa hàng",
    icon: Package,
    matches: (pathname) => pathname.startsWith("/admin/products"),
  },
  {
    href: "/admin/categories",
    label: "Danh mục",
    group: "Quản lý cửa hàng",
    icon: FolderTree,
    matches: (pathname) => pathname.startsWith("/admin/categories"),
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng online",
    group: "Vận chuyển",
    icon: PackageCheck,
    matches: (pathname) => pathname.startsWith("/admin/orders"),
  },
  {
    href: "/admin/shipping",
    label: "Vận chuyển",
    group: "Vận chuyển",
    icon: Truck,
    matches: (pathname) => pathname.startsWith("/admin/shipping"),
  },
  {
    href: "/admin/content/banners",
    label: "Banner",
    group: "Nội dung website",
    icon: Megaphone,
    matches: (pathname) => pathname.startsWith("/admin/content/banners"),
  },
  {
    href: "/admin/content/policies",
    label: "Chính sách",
    group: "Nội dung website",
    icon: ScrollText,
    matches: (pathname) => pathname.startsWith("/admin/content/policies"),
  },
];

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/admin/memberships/benefits"))
    return "Quyền lợi membership";
  if (pathname === "/admin/memberships") return "Hạng membership";
  if (pathname.startsWith("/admin/users")) return "Người dùng";
  if (pathname.startsWith("/admin/profile")) return "Thông tin cá nhân";
  if (pathname.startsWith("/admin/notifications")) return "Thông báo";
  if (pathname.startsWith("/admin/settings/notifications"))
    return "Cài đặt thông báo";
  if (pathname === "/admin/orders") return "Đơn hàng online";
  if (pathname.startsWith("/admin/orders/")) return "Chi tiết đơn hàng";
  if (pathname.startsWith("/admin/products")) return "Sản phẩm";
  if (pathname.startsWith("/admin/categories")) return "Danh mục";
  if (pathname.startsWith("/admin/shipping")) return "Vận chuyển";
  if (pathname.startsWith("/admin/content/banners")) return "Banner";
  if (pathname.startsWith("/admin/content/policies")) return "Chính sách";
  if (pathname.startsWith("/admin/daily-detail/")) return "Chi tiết ngày";
  if (pathname.startsWith("/admin/monthly-detail/")) return "Chi tiết tháng";
  return "Tổng quan";
};

function AdminNavigation({
  mobile = false,
  orderAttentionCount = 0,
}: {
  mobile?: boolean;
  orderAttentionCount?: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Điều hướng quản trị" className="space-y-1 px-3">
      {ADMIN_NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const active = item.matches(pathname);
        const isFirstInGroup =
          index === 0 || ADMIN_NAV_ITEMS[index - 1].group !== item.group;
        const link = (
          <Link
            href={item.href}
            className={cn(
              "flex h-10 min-w-0 items-center gap-3 rounded-lg border-l-2 px-3 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "border-primary bg-(--admin-sidebar-hover) text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                : "border-transparent text-slate-300 hover:bg-(--admin-sidebar-hover) hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.href === "/admin/orders" && orderAttentionCount > 0 ? (
              <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-10px font-bold text-white">
                {orderAttentionCount > 99 ? "99+" : orderAttentionCount}
              </span>
            ) : null}
          </Link>
        );

        return (
          <div
            key={item.href}
            className={isFirstInGroup ? "pt-3 first:pt-0" : undefined}
          >
            {isFirstInGroup ? (
              <p className="mb-2 px-3 text-10px font-semibold uppercase tracking-[0.12em] text-slate-400/75">
                {item.group}
              </p>
            ) : null}
            {mobile ? <SheetClose asChild>{link}</SheetClose> : link}
          </div>
        );
      })}
    </nav>
  );
}

function AdminBrand() {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-3 px-4">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white">
        <Image
          src="/logo-quynh-nhi-store-mark.svg"
          alt="Quỳnh Nhi Store"
          width={36}
          height={36}
          className="size-9 object-contain"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">
          Quỳnh Nhi Store
        </span>
        <span className="block text-xs font-medium text-slate-400">
          Khu vực quản trị
        </span>
      </span>
    </Link>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [orderAttentionCount, setOrderAttentionCount] = useState(0);

  const loadOrderAttentionCount = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/orders?limit=1", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = await response.json();
      setOrderAttentionCount(
        Number(data.counts?.pending || 0) +
          Number(data.counts?.confirmed || 0) +
          Number(data.counts?.preparing || 0),
      );
    } catch {
      // Keep navigation usable while the attention count is unavailable.
    }
  }, []);

  useEffect(() => {
    void loadOrderAttentionCount();
    window.addEventListener(
      "admin-order-notification",
      loadOrderAttentionCount,
    );
    return () =>
      window.removeEventListener(
        "admin-order-notification",
        loadOrderAttentionCount,
      );
  }, [loadOrderAttentionCount]);

  return (
    <div className="admin-shell min-h-svh bg-(--admin-background) text-(--admin-text)">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/5 bg-(--admin-sidebar) lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-white/8">
          <AdminBrand />
        </div>
        <div className="flex-1 py-5">
          <AdminNavigation orderAttentionCount={orderAttentionCount} />
        </div>
      </aside>

      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-(--z-header) flex h-[var(--admin-header-height)] items-center justify-between gap-3 border-b border-(--admin-border) bg-white/95 px-4 backdrop-blur sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-lg border border-(--admin-border) bg-(--admin-surface) text-(--admin-text-secondary) hover:bg-(--admin-primary-soft) hover:text-primary lg:hidden"
                  aria-label="Mở menu quản trị"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col bg-(--admin-sidebar) p-0 text-white [&>button]:text-slate-300 [&>button:hover]:bg-white/10 [&>button:hover]:text-white">
                <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
                <SheetDescription className="sr-only">
                  Điều hướng các trang quản trị của cửa hàng
                </SheetDescription>
                <div className="flex h-16 items-center border-b border-white/8 pr-12">
                  <AdminBrand />
                </div>
                <div className="flex-1 py-5">
                  <AdminNavigation
                    mobile
                    orderAttentionCount={orderAttentionCount}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <p className="truncate text-sm font-semibold text-(--admin-text-secondary)">
              {getPageTitle(pathname)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AdminNotificationCenter />
            <AdminAccountMenu />
          </div>
        </header>

        <main className="w-full max-w-full min-w-0">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
