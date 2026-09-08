"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { Heart, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type FavoriteChangedDetail = { productId: number; isFavorited: boolean; displayFavoriteCount: number };
const FAVORITE_EVENT = "storefront:favorite-changed";

export default function ProductFavoriteButton({ productId, initialIsFavorited = false, initialCount = 0, onChange, compact = false }: { productId: number; initialIsFavorited?: boolean; initialCount?: number; onChange?: (detail: FavoriteChangedDetail) => void; compact?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [count, setCount] = useState(Math.max(0, initialCount));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
    setCount(Math.max(0, initialCount));
  }, [initialCount, initialIsFavorited]);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<FavoriteChangedDetail>).detail;
      if (detail?.productId !== productId) return;
      setIsFavorited(detail.isFavorited);
      setCount(Math.max(0, detail.displayFavoriteCount));
    };
    window.addEventListener(FAVORITE_EVENT, handleChange);
    return () => window.removeEventListener(FAVORITE_EVENT, handleChange);
  }, [productId]);

  const toggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    if (!isAuthenticated || user?.role !== "CUSTOMER") {
      const returnUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    const previous = { isFavorited, count };
    const nextIsFavorited = !isFavorited;
    setIsFavorited(nextIsFavorited);
    setCount(Math.max(0, count + (nextIsFavorited ? 1 : -1)));
    setPending(true);
    try {
      const response = await fetch(`/api/product/${productId}/favorite`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFavorite: nextIsFavorited }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể cập nhật yêu thích.");
      const detail = { productId, isFavorited: Boolean(data.isFavorited), displayFavoriteCount: Math.max(0, Number(data.displayFavoriteCount || 0)) };
      setIsFavorited(detail.isFavorited);
      setCount(detail.displayFavoriteCount);
      window.dispatchEvent(new CustomEvent(FAVORITE_EVENT, { detail }));
      onChange?.(detail);
    } catch {
      setIsFavorited(previous.isFavorited);
      setCount(previous.count);
    } finally {
      setPending(false);
    }
  };

  return <button type="button" disabled={pending} onClick={toggle} aria-label={isFavorited ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"} aria-pressed={isFavorited} title={`${isFavorited ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"} · ${count} lượt`} className={`inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full transition ${isFavorited ? "bg-[#FCEEF3] text-[#D96C8A]" : "bg-white/90 text-[#6F686B] hover:text-[#D96C8A]"} ${compact ? "p-2" : "px-2.5 py-2"}`}>
    {pending ? <Loader2 className="size-4 animate-spin" /> : <Heart className={`size-4 transition-transform ${isFavorited ? "fill-current scale-110" : ""}`} />}
    {!compact ? <span className="text-xs font-bold">{formatCompactNumber(count)}</span> : null}
  </button>;
}
