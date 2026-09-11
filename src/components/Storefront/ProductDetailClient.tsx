"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import ProductCard from "@/components/Storefront/ProductCard";
import ProductFavoriteButton from "@/components/Storefront/ProductFavoriteButton";
import RichTextRenderer from "@/components/RichText/RichTextRenderer";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useCart } from "@/components/Storefront/CartProvider";
import type {
  ProductApiItem,
  ProductVariantApiItem,
} from "@/interface/product";
import { Skeleton } from "@/components/ui/skeleton";

const money = (value: number | string) =>
  `${Number(value).toLocaleString("vi-VN")}đ`;
const stockOf = (
  variant?: ProductVariantApiItem | null,
  product?: ProductApiItem | null,
) =>
  Math.max(
    0,
    Number(variant?.quantity ?? product?.quantity ?? 0) -
      Number(variant?.reservedQuantity ?? 0),
  );

function LoadingState() {
  return (
    <main
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <Skeleton className="h-4 w-72" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-5 py-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { add } = useCart();
  const { isAuthenticated, user } = useAuth();
  const selectorRef = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<ProductApiItem[]>([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setProduct(null);
    setNotFound(false);
    fetch(`/api/products/${params.id}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: ProductApiItem) => {
        setProduct(data);
        setSelectedColor("");
        setSelectedSize("");
        setSelectedVariantId(null);
        setActiveImage(data.images?.[0]?.url || data.imageUrl || "");
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") {
          setProduct(null);
          setNotFound(true);
        }
      });
    return () => controller.abort();
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    fetch(`/api/products/${product.id}/related?limit=8`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { data?: ProductApiItem[] }) => setRelated(data.data || []))
      .catch(() => setRelated([]));
  }, [product]);

  const variants = useMemo(
    () => (product?.variants || []).filter((variant) => variant.isActive),
    [product],
  );
  const colors = useMemo(
    () => [
      ...new Map(
        variants
          .filter((variant) => variant.color)
          .map((variant) => [variant.color || "", variant]),
      ).values(),
    ],
    [variants],
  );
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) || null;
  const sizes = variants
    .filter((variant) => !selectedColor || variant.color === selectedColor)
    .filter((variant) => variant.size);
  const stock = stockOf(selectedVariant, product);
  const prices = variants
    .map((variant) => Number(variant.sellPrice))
    .filter((value) => value > 0);
  const currentPrice = selectedVariant
    ? Number(selectedVariant.sellPrice)
    : prices.length
      ? Math.min(...prices)
      : Number(product?.sellPrice || 0);
  const maxPrice = prices.length ? Math.max(...prices) : currentPrice;
  const comparePrice = selectedVariant?.comparePrice
    ? Number(selectedVariant.comparePrice)
    : 0;
  const discount =
    comparePrice > currentPrice
      ? Math.round((1 - currentPrice / comparePrice) * 100)
      : 0;
  const colorImages = variants
    .filter((variant) => variant.color === selectedColor)
    .flatMap((variant) => variant.images || []);
  const gallery = [
    ...new Map(
      [
        ...(selectedVariant?.images || []),
        ...colorImages,
        ...(product?.images || []),
      ].map((image) => [image.url, image]),
    ).values(),
  ];
  useEffect(() => {
    const next = gallery[0]?.url || product?.imageUrl || "";
    setActiveImage((current) =>
      gallery.some((image) => image.url === current) ? current : next,
    );
    setImageFailed(false);
  }, [gallery, product?.imageUrl]);
  useEffect(() => {
    setQuantity((value) => Math.max(1, Math.min(value, Math.max(1, stock))));
  }, [stock, selectedVariantId]);

  if (!product)
    return (
      <StorefrontShell>
        {notFound ? (
          <main className="mx-auto max-w-xl px-4 py-24 text-center">
            <h1 className="text-2xl font-extrabold">Không tìm thấy sản phẩm</h1>
            <p className="mt-3 text-sm text-[#6F6066]">
              Sản phẩm có thể đã được gỡ hoặc không còn khả dụng.
            </p>
            <div className="mt-7 flex justify-center gap-2">
              <Link
                href="/products"
                className="bg-[#D96C8A] px-5 py-3 text-sm font-bold text-white"
              >
                Xem sản phẩm khác
              </Link>
              <Link
                href="/"
                className="border border-[#D96C8A] px-5 py-3 text-sm font-bold text-[#A43E5F]"
              >
                Về trang chủ
              </Link>
            </div>
          </main>
        ) : (
          <LoadingState />
        )}
      </StorefrontShell>
    );
  const selectColor = (color: string) => {
    const sameSize =
      selectedSize &&
      variants.some(
        (variant) => variant.color === color && variant.size === selectedSize,
      );
    setSelectedColor(color);
    setSelectedSize(sameSize ? selectedSize : "");
    setSelectedVariantId(
      sameSize
        ? variants.find(
            (variant) =>
              variant.color === color && variant.size === selectedSize,
          )?.id || null
        : null,
    );
    setError("");
  };
  const selectSize = (variant: ProductVariantApiItem) => {
    setSelectedSize(variant.size || "");
    setSelectedVariantId(variant.id);
    setError("");
  };
  const requireVariant = () => {
    if (!variants.length) return Number(product.quantity) > 0;
    if (variants.some((variant) => variant.color) && !selectedColor) {
      setError("Vui lòng chọn màu sắc.");
      selectorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }
    if (
      variants.some((variant) => variant.size) &&
      (!selectedSize || !selectedVariant)
    ) {
      setError("Vui lòng chọn kích thước.");
      selectorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }
    if (!selectedVariant) {
      setError("Vui lòng chọn biến thể.");
      selectorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }
    if (!stock) {
      setError("Sản phẩm này hiện đã hết hàng.");
      return false;
    }
    return true;
  };
  const returnPath = `${window.location.pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
  const addToCart = async () => {
    setMessage("");
    if (!isAuthenticated || user?.role !== "CUSTOMER")
      return router.push(`/login?redirect=${encodeURIComponent(returnPath)}`);
    if (!requireVariant()) return;
    if (quantity > stock) return setError("Số lượng sản phẩm không còn đủ.");
    setMessage(
      (await add(product, selectedVariant?.id, quantity))
        ? "Đã thêm sản phẩm vào giỏ hàng."
        : "Không thể thêm sản phẩm vào giỏ hàng.",
    );
  };
  const buyNow = async () => {
    setMessage("");
    if (!isAuthenticated || user?.role !== "CUSTOMER")
      return router.push(`/login?redirect=${encodeURIComponent(returnPath)}`);
    if (!requireVariant() || !selectedVariant) return;
    const response = await fetch("/api/checkout/buy-now-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      return setError(
        data.message || "Không thể tiếp tục thanh toán. Vui lòng thử lại.",
      );
    router.push(`/checkout?intent=${encodeURIComponent(data.token)}`);
  };
  const categoryHref = product.category?.id
    ? `/products?categoryId=${product.category.id}`
    : "/products";
  const canBuy = !variants.length
    ? Number(product.quantity) > 0
    : Boolean(selectedVariant && stock > 0);
  const imageIndex = Math.max(
    0,
    gallery.findIndex((image) => image.url === activeImage),
  );
  const changeImage = (offset: number) =>
    setActiveImage(
      gallery[(imageIndex + offset + gallery.length) % gallery.length]?.url ||
        product.imageUrl,
    );

  return (
    <StorefrontShell>
      <main className="pb-28 sm:pb-10">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <nav
            className="flex min-w-0 items-center gap-2 text-xs text-[#998B91]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="shrink-0 hover:text-[#D96C8A]">
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              href={categoryHref}
              className="max-w-32 truncate hover:text-[#D96C8A]"
            >
              {product.category?.name || "Sản phẩm"}
            </Link>
            <span>/</span>
            <span className="min-w-0 truncate text-[#6F6066]">
              {product.title}
            </span>
          </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] lg:gap-16">
            <section className="min-w-0" aria-label="Hình ảnh sản phẩm">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                <div className="order-2 flex w-full shrink-0 gap-2 overflow-x-auto sm:order-1 sm:w-[88px] sm:flex-col">
                  {gallery.map((image, index) => (
                    <button
                      key={image.id || image.url}
                      type="button"
                      aria-label={`Xem ảnh ${index + 1}`}
                      aria-current={activeImage === image.url}
                      onClick={() => setActiveImage(image.url)}
                      className={`size-20 shrink-0 overflow-hidden border-2 bg-white sm:size-[80px] ${activeImage === image.url ? "border-[#D96C8A]" : "border-transparent"}`}
                    >
                      <img
                        src={image.url}
                        alt={
                          image.altText || `${product.title} - ảnh ${index + 1}`
                        }
                        className="size-full object-cover"
                        loading={index > 2 ? "lazy" : "eager"}
                      />
                    </button>
                  ))}
                </div>
                <div className="relative order-1 h-[420px] w-full flex-none overflow-hidden bg-[#F5EEF0] sm:order-2 sm:h-[620px] sm:min-w-0 sm:flex-1 lg:h-[720px]">
                  {imageFailed ? (
                    <div className="flex size-full items-center justify-center px-8 text-center text-sm font-semibold text-[#998B91]">
                      Ảnh sản phẩm đang được cập nhật
                    </div>
                  ) : (
                    <img
                      src={activeImage || product.imageUrl}
                      alt={product.title}
                      onError={() => setImageFailed(true)}
                      className="absolute inset-0 size-full object-cover"
                      fetchPriority="high"
                    />
                  )}
                  {gallery.length > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label="Ảnh trước"
                        onClick={() => changeImage(-1)}
                        className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#6F6066] shadow-sm"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Ảnh sau"
                        onClick={() => changeImage(1)}
                        className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#6F6066] shadow-sm"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 bg-white/90 px-2.5 py-1 text-xs font-bold text-[#6F6066]">
                        {imageIndex + 1} / {gallery.length}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </section>
            <section className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
              <p className="text-sm font-bold text-[#D96C8A]">
                {product.category?.name}
              </p>
              <div className="mt-2 flex items-start gap-3">
                <h1 className="min-w-0 flex-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
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
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-2xl font-extrabold text-[#A43E5F]">
                  {money(currentPrice)}
                  {!selectedVariant && maxPrice > currentPrice ? (
                    <span className="text-lg"> – {money(maxPrice)}</span>
                  ) : null}
                </p>
                {discount ? (
                  <>
                    <del className="text-sm text-[#998B91]">
                      {money(comparePrice)}
                    </del>
                    <span className="text-xs font-bold text-[#398866]">
                      -{discount}%
                    </span>
                  </>
                ) : null}
              </div>
              {product.description ? (
                <RichTextRenderer
                  html={product.description}
                  compact
                  className="mt-4 max-h-24 overflow-hidden text-sm leading-6 text-[#6F6066]"
                />
              ) : null}
              <div ref={selectorRef} className="mt-6 space-y-6">
                {colors.length ? (
                  <div>
                    <p className="mb-3 text-sm font-bold">
                      Màu sắc
                      {selectedColor ? (
                        <span className="ml-1 font-normal text-[#6F6066]">
                          · {selectedColor}
                        </span>
                      ) : null}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((variant) => {
                        const color = variant.color || "";
                        const hasStock = variants.some(
                          (item) => item.color === color && stockOf(item) > 0,
                        );
                        return (
                          <button
                            key={color}
                            type="button"
                            disabled={!hasStock}
                            aria-pressed={selectedColor === color}
                            aria-label={`Màu ${color}${hasStock ? "" : " - hết hàng"}`}
                            onClick={() => selectColor(color)}
                            className={`flex min-h-11 items-center gap-2 border px-3 py-2 text-sm font-semibold ${selectedColor === color ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#6F6066]"} disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            <i
                              className="size-5 rounded-full border border-white shadow-[0_0_0_1px_#EAE1E4]"
                              style={{
                                backgroundColor: variant.colorCode || "#D96C8A",
                              }}
                            />
                            {color}
                            {selectedColor === color ? (
                              <span aria-hidden="true">✓</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {variants.length ? (
                  <div>
                    <p className="mb-3 text-sm font-bold">Kích thước</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.length ? (
                        sizes.map((variant) => {
                          const itemStock = stockOf(variant);
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              disabled={!itemStock}
                              aria-pressed={selectedVariantId === variant.id}
                              onClick={() => selectSize(variant)}
                              className={`min-h-11 min-w-12 border px-3 text-sm font-bold ${selectedVariantId === variant.id ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#6F6066]"} disabled:cursor-not-allowed disabled:bg-[#FAF8F8] disabled:text-[#998B91] disabled:line-through`}
                            >
                              {variant.size}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-sm text-[#998B91]">
                          Chọn màu để xem kích thước.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              {selectedVariant ? (
                <p className="mt-5 text-xs text-[#998B91]">
                  SKU: {selectedVariant.sku}
                </p>
              ) : null}
              <p
                className={`mt-2 text-sm font-semibold ${!canBuy ? "text-[#C84F64]" : stock <= 3 ? "text-[#C84F64]" : "text-[#398866]"}`}
              >
                {!canBuy
                  ? "Sản phẩm hiện đang hết hàng"
                  : stock <= 3
                    ? `Chỉ còn ${stock} sản phẩm`
                    : "Còn hàng"}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <span className="text-sm font-bold">Số lượng</span>
                <div className="flex items-center border border-[#EAE1E4]">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="flex size-11 items-center justify-center disabled:opacity-35"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    disabled={!canBuy || quantity >= stock}
                    onClick={() =>
                      setQuantity((value) => Math.min(stock, value + 1))
                    }
                    className="flex size-11 items-center justify-center disabled:opacity-35"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              {error ? (
                <p
                  role="alert"
                  className="mt-3 text-sm font-semibold text-[#C84F64]"
                >
                  {error}
                </p>
              ) : null}
              {message ? (
                <p
                  role="status"
                  className="mt-3 text-sm font-semibold text-[#398866]"
                >
                  {message}
                </p>
              ) : null}
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => void addToCart()}
                  className="flex h-12 items-center justify-center gap-2 border border-[#D96C8A] px-4 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ShoppingBag className="size-4" />
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={() => void buyNow()}
                  className="h-12 bg-[#D96C8A] px-4 text-sm font-bold text-white hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Mua ngay
                </button>
              </div>
              <div className="mt-6 grid gap-3 border-t border-[#EAE1E4] pt-5 text-sm text-[#6F6066]">
                <p className="flex items-center gap-3">
                  <Truck className="size-4 text-[#D96C8A]" />
                  Giao hàng toàn quốc
                </p>
                <p className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-[#D96C8A]" />
                  Thanh toán COD hoặc MoMo
                </p>
                <Link
                  href="/policies?policy=return-refund"
                  className="flex items-center gap-3 hover:text-[#A43E5F]"
                >
                  <RotateCcw className="size-4 text-[#D96C8A]" />
                  Đổi sản phẩm theo chính sách
                </Link>
              </div>
            </section>
          </div>
          {product.description ? (
            <section className="mt-14 border-t border-[#EAE1E4] pt-8">
              <h2 className="text-xl font-extrabold">Thông tin sản phẩm</h2>
              <RichTextRenderer
                html={product.description}
                className="product-description mt-5 max-w-3xl text-[#6F6066]"
              />
            </section>
          ) : null}
          {related.length ? (
            <section className="mt-14 border-t border-[#EAE1E4] pt-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-xl font-extrabold">Có thể bạn sẽ thích</h2>
                <Link
                  href={categoryHref}
                  className="text-sm font-bold text-[#A43E5F] hover:text-[#D96C8A]"
                >
                  Xem thêm sản phẩm
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EAE1E4] bg-white/95 p-3 backdrop-blur sm:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canBuy}
            onClick={() => void addToCart()}
            className="h-11 border border-[#D96C8A] text-xs font-bold text-[#A43E5F] disabled:opacity-45"
          >
            Thêm vào giỏ
          </button>
          <button
            type="button"
            disabled={!canBuy}
            onClick={() => void buyNow()}
            className="h-11 bg-[#D96C8A] text-xs font-bold text-white disabled:opacity-45"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </StorefrontShell>
  );
}
