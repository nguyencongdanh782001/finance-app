"use client";
/* eslint-disable @next/next/no-img-element */
import { useCart } from "@/components/Storefront/CartProvider";
import { useAuth } from "@/components/Auth/AuthProvider";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import ProductFavoriteButton from "@/components/Storefront/ProductFavoriteButton";
import type { ProductApiItem } from "@/interface/product";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextRenderer from "@/components/RichText/RichTextRenderer";

const money = (value: number | string) =>
  `${Number(value).toLocaleString("vi-VN")}đ`;
export default function ProductDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number>();
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/product/${params.id}?public=true`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: ProductApiItem) => {
        setProduct(data);
        setImage(data.images?.[0]?.url || data.imageUrl);
        const first = data.variants?.find(
          (variant) => variant.isActive && variant.quantity > 0,
        );
        if (first) setSelectedVariant(first.id);
      })
      .catch(() => setProduct(null));
  }, [params.id]);
  const variants =
    product?.variants?.filter((variant) => variant.isActive) || [];
  const active = variants.find((variant) => variant.id === selectedVariant);
  const colors = [
    ...new Set(variants.map((variant) => variant.color).filter(Boolean)),
  ];
  const sizes = variants.filter((variant) => variant.color === active?.color);
  const stock = Number(active?.quantity ?? product?.quantity ?? 0);
  const price = active?.sellPrice ?? product?.sellPrice ?? 0;
  if (!product)
    return (
      <StorefrontShell>
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-[500px] rounded-3xl" />
        </main>
      </StorefrontShell>
    );
  const chooseVariant = (id: number) => {
    setSelectedVariant(id);
    setQuantity(1);
    setError("");
    const selected = variants.find((variant) => variant.id === id);
    if (selected?.images?.[0]?.url) setImage(selected.images[0].url);
  };
  const addToCart = async () => {
    if (!isAuthenticated)
      return router.push(
        `/login?redirect=${encodeURIComponent(`/products/${params.id}`)}`,
      );
    if (variants.length && !active)
      return setError("Vui lòng chọn màu và kích thước.");
    if (!stock) return setError("Sản phẩm hiện đã hết hàng.");
    setError(
      (await add(product, active?.id, quantity))
        ? "Đã thêm sản phẩm vào giỏ hàng."
        : "Không thể thêm sản phẩm vào giỏ hàng.",
    );
  };
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-[78px_1fr]">
            <div className="order-2 flex gap-2 overflow-auto sm:order-1 sm:flex-col">
              {[...(product.images || []), ...(active?.images || [])].map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setImage(item.url)}
                    className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 ${image === item.url ? "border-[#D96C8A]" : "border-transparent"}`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                ),
              )}
            </div>
            <div className="order-1 aspect-[4/5] overflow-hidden rounded-3xl bg-[#F5EEF0] sm:order-2">
              <img
                src={image || product.imageUrl}
                alt={product.title}
                className="size-full object-cover"
              />
            </div>
          </div>
          <div className="py-2">
            <p className="text-sm font-bold text-[#D96C8A]">
              {product.category?.name}
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                {product.title}
              </h1>
              <ProductFavoriteButton
                productId={product.id}
                initialIsFavorited={product.isFavorited}
                initialCount={product.displayFavoriteCount}
                onChange={(detail) =>
                  setProduct((current) =>
                    current ? { ...current, ...detail } : current,
                  )
                }
              />
            </div>
            <p className="mt-4 text-2xl font-extrabold text-[#A43E5F]">
              {money(price)}
            </p>
            {product.description && (
              <RichTextRenderer
                html={product.description}
                className="mt-5 text-sm text-[#6F686B]"
              />
            )}
            {colors.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-bold">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const option = variants.find(
                      (variant) => variant.color === color,
                    );
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => option && chooseVariant(option.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${active?.color === color ? "border-[#D96C8A] bg-[#FFF3F6] text-[#A43E5F]" : "border-[#E9E2E5]"}`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {variants.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold">Kích thước</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!variant.quantity}
                      onClick={() => chooseVariant(variant.id)}
                      className={`min-w-12 rounded-lg border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35 ${active?.id === variant.id ? "border-[#D96C8A] bg-[#FFF3F6] text-[#A43E5F]" : "border-[#E9E2E5]"}`}
                    >
                      {variant.size || "Mặc định"}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-7 flex items-center gap-4">
              <span className="text-sm font-bold">Số lượng</span>
              <div className="flex items-center rounded-full border border-[#E9E2E5]">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="p-2"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="text-xs text-[#8A7D81]">
                {stock > 0 ? `Còn ${stock} sản phẩm` : "Hết hàng"}
              </span>
            </div>
            {error && (
              <p
                className={`mt-3 text-sm font-semibold ${error.startsWith("Đã") ? "text-emerald-600" : "text-red-600"}`}
              >
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={!stock}
              onClick={addToCart}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D96C8A] text-sm font-extrabold text-white hover:bg-[#C55778] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="size-4" /> Thêm vào giỏ hàng
            </button>
            <div className="mt-8 grid gap-4 border-t border-[#E9E2E5] pt-6 text-sm text-[#6F686B]">
              <p className="flex items-center gap-3">
                <Truck className="size-5 text-[#D96C8A]" /> Giao hàng nhanh toàn
                quốc
              </p>
              <p className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-[#D96C8A]" /> Thanh toán an
                toàn
              </p>
              <p className="flex items-center gap-3">
                <RotateCcw className="size-5 text-[#D96C8A]" /> Đổi trả dễ dàng
              </p>
            </div>
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
