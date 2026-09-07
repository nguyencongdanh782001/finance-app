"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { authTokenStorage } from "@/endpoint/appAxios";
import type { ProductApiItem } from "@/interface/product";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type StorefrontCartItem = { id: number; key: string; productId: number; variantId?: number; title: string; imageUrl: string; price: number; variantLabel?: string; quantity: number; stock: number };
type CartContextValue = { items: StorefrontCartItem[]; count: number; isLoading: boolean; add: (product: ProductApiItem, variantId?: number, quantity?: number) => Promise<boolean>; update: (key: string, quantity: number) => Promise<void>; remove: (key: string) => Promise<void> };
const CartContext = createContext<CartContextValue | null>(null);

async function request(path: string, options?: RequestInit) {
  const token = authTokenStorage.getAccessToken();
  return fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers } });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth(); const [items, setItems] = useState<StorefrontCartItem[]>([]); const [isLoading, setIsLoading] = useState(false);
  const load = useCallback(async () => { if (!isAuthenticated) { setItems([]); return; } setIsLoading(true); try { const response = await request("/api/cart"); if (response.ok) setItems(((await response.json()) as { items: StorefrontCartItem[] }).items); } finally { setIsLoading(false); } }, [isAuthenticated]);
  useEffect(() => { if (!isInitializing) void load(); }, [isInitializing, load]);
  const add = useCallback(async (product: ProductApiItem, variantId?: number, quantity = 1) => { const response = await request("/api/cart", { method: "POST", body: JSON.stringify({ productId: product.id, variantId, quantity }) }); if (!response.ok) return false; await load(); return true; }, [load]);
  const update = useCallback(async (key: string, quantity: number) => { const item = items.find((entry) => entry.key === key); if (!item) return; const response = await request(`/api/cart/${item.id}`, { method: "PATCH", body: JSON.stringify({ quantity }) }); if (response.ok) await load(); }, [items, load]);
  const remove = useCallback(async (key: string) => { const item = items.find((entry) => entry.key === key); if (!item) return; const response = await request(`/api/cart/${item.id}`, { method: "DELETE" }); if (response.ok) await load(); }, [items, load]);
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), isLoading, add, update, remove }), [add, isLoading, items, remove, update]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }
