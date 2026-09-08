"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import ProductCard from "@/components/Storefront/ProductCard";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import type { ProductApiItem } from "@/interface/product";
import { isAdminRole } from "@/lib/auth/routing";
import { Heart, Loader2, RefreshCw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type FavoriteItem = { favoriteId: number; favoritedAt: string; product: ProductApiItem };

function FavoritesContent() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated || !user || isAdminRole(user.role)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    fetch("/api/me/favorites?limit=48")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { items: FavoriteItem[] }) => setItems(data.items || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isInitializing, pathname, router, user]);

  const retry = () => {
    setError(false); setLoading(true);
    fetch("/api/me/favorites?limit=48")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { items: FavoriteItem[] }) => setItems(data.items || []))
      .catch(() => setError(true)).finally(() => setLoading(false));
  };

  return <StorefrontShell><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-[#D96C8A]">Bộ sưu tập cá nhân</p><h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Sản phẩm yêu thích</h1><p className="mt-2 text-sm text-[#6F686B]">Lưu lại những món đồ bạn muốn xem lại sau.</p></div>{!loading && !error && <span className="rounded-full bg-[#FFF3F6] px-3 py-1 text-sm font-bold text-[#A43E5F]">{items.length} sản phẩm</span>}</div>{loading || isInitializing ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="space-y-3"><div className="aspect-[4/5] animate-pulse rounded-2xl bg-[#F5EEF0]" /><div className="h-4 w-3/4 animate-pulse rounded bg-[#F5EEF0]" /></div>)}</div> : error ? <div className="rounded-3xl border border-[#E9E2E5] bg-white px-6 py-16 text-center"><p className="font-bold">Không thể tải danh sách yêu thích</p><button type="button" onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#D96C8A] px-5 py-2.5 text-sm font-bold text-white"><RefreshCw className="size-4" /> Thử lại</button></div> : items.length === 0 ? <div className="rounded-3xl border border-dashed border-[#E9E2E5] bg-white px-6 py-20 text-center"><Heart className="mx-auto size-10 text-[#D96C8A]" /><h2 className="mt-4 text-xl font-extrabold">Danh sách đang trống</h2><p className="mt-2 text-sm text-[#6F686B]">Nhấn biểu tượng trái tim ở sản phẩm để lưu lại.</p></div> : <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{items.map((item) => <ProductCard key={item.product.id} product={item.product} onFavoriteChange={(detail) => { if (!detail.isFavorited) setItems((current) => current.filter((favorite) => favorite.product.id !== detail.productId)); }} />)}</div>}</main></StorefrontShell>;
}

export default function FavoritesPageClient() {
  return <Suspense fallback={<div className="min-h-screen bg-[#FFFCFA]" />}><FavoritesContent /></Suspense>;
}
