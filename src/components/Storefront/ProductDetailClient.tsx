"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import ProductCard from "@/components/Storefront/ProductCard";
import ProductFavoriteButton from "@/components/Storefront/ProductFavoriteButton";
import ProductReviews from "@/components/Storefront/ProductReviews";
import RichTextRenderer from "@/components/RichText/RichTextRenderer";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useCart } from "@/components/Storefront/CartProvider";
import type {
  ProductApiItem,
  ProductVariantApiItem,
} from "@/interface/product";
import { Skeleton } from "@/components/ui/skeleton";
import { buildLoginUrl } from "@/lib/auth/routing";
import {
  isMeaningfulVisibleView,
  PRODUCT_VIEW_THRESHOLD_MS,
} from "@/lib/recommendations-policy";

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

type CacheEntry<T> = { data: T; cachedAt: number };

const productCache = new Map<string, CacheEntry<ProductApiItem>>();
const relatedProductsCache = new Map<number, CacheEntry<ProductApiItem[]>>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000;
const MAX_PRODUCT_CACHE_ENTRIES = 20;
const MAX_RELATED_CACHE_ENTRIES = 20;

function readCache<K, V>(cache: Map<K, CacheEntry<V>>, key: K) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt >= CLIENT_CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache<K, V>(
  cache: Map<K, CacheEntry<V>>,
  key: K,
  data: V,
  maxEntries: number,
) {
  cache.delete(key);
  cache.set(key, { data, cachedAt: Date.now() });
  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
}

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
      <section className="mt-14 border-t border-[#EAE1E4] pt-8">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-3 h-4 w-4/5 max-w-2xl" />
        <div className="mt-6 max-w-3xl space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-10 w-28" />
        </div>
      </section>
      <section className="mt-14 border-t border-[#EAE1E4] pt-8">
        <Skeleton className="h-7 w-52" />
        <div className="mt-6 grid gap-0 overflow-hidden rounded-3xl border border-[#EAE1E4] bg-white lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
          <div className="space-y-5 bg-[#FFF8FA] p-6 sm:p-8">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-5" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          ))}
        </div>
      </section>
      <section className="mt-14 border-t border-[#EAE1E4] pt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function ProductDetailClient() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { add } = useCart();
  const { isAuthenticated, isInitializing, user } = useAuth();
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
  const [imageZoom, setImageZoom] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [buyNowProcessing, setBuyNowProcessing] = useState(false);
  const resumeHandledRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    resumeHandledRef.current = false;
    const productQuery = new URLSearchParams(window.location.search);
    const restoreSelection = (data: ProductApiItem) => {
      const color = productQuery.get("color") || "";
      const size = productQuery.get("size") || "";
      const activeVariants = (data.variants || []).filter(
        (variant) => variant.isActive,
      );
      const requiresColor = activeVariants.some((variant) => variant.color);
      const requiresSize = activeVariants.some((variant) => variant.size);
      const restoredVariant = data.variants?.find(
        (variant) =>
          variant.isActive &&
          (!requiresColor || Boolean(color)) &&
          (!requiresSize || Boolean(size)) &&
          (!requiresColor || variant.color === color) &&
          (!requiresSize || variant.size === size),
      );
      const firstAvailableVariant =
        activeVariants.find((variant) => stockOf(variant, data) > 0) ||
        activeVariants[0] ||
        null;
      const defaultVariant =
        restoredVariant && stockOf(restoredVariant, data) > 0
          ? restoredVariant
          : firstAvailableVariant;
      setSelectedColor(defaultVariant?.color || "");
      setSelectedSize(defaultVariant?.size || "");
      setSelectedVariantId(defaultVariant?.id || null);
      const parsedQuantity = Number(productQuery.get("quantity"));
      if (Number.isInteger(parsedQuantity) && parsedQuantity > 0) {
        setQuantity(parsedQuantity);
      }
    };
    const cachedData = readCache(productCache, params.id);
    if (cachedData) {
      setProduct(cachedData);
      restoreSelection(cachedData);
      setActiveImage(cachedData.images?.[0]?.url || cachedData.imageUrl || "");
      setImageZoom(1);
      setDescriptionExpanded(false);
    } else {
      setProduct(null);
    }
    setNotFound(false);
    fetch(`/api/products/${params.id}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: ProductApiItem) => {
        writeCache(productCache, params.id, data, MAX_PRODUCT_CACHE_ENTRIES);
        setProduct(data);
        restoreSelection(data);
        setActiveImage(data.images?.[0]?.url || data.imageUrl || "");
        setImageZoom(1);
        setDescriptionExpanded(false);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") {
          if (!cachedData) {
            setProduct(null);
            setNotFound(true);
          }
        }
      });
    return () => controller.abort();
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    const controller = new AbortController();
    const cachedData = readCache(relatedProductsCache, product.id);
    if (cachedData) setRelated(cachedData);
    else setRelated([]);
    fetch(`/api/products/${product.id}/related?limit=8`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { data?: ProductApiItem[] }) => {
        const items = data.data || [];
        writeCache(
          relatedProductsCache,
          product.id,
          items,
          MAX_RELATED_CACHE_ENTRIES,
        );
        setRelated(items);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError" && !cachedData) setRelated([]);
      });
    return () => controller.abort();
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const identifier = String(params.id);
    if (identifier !== String(product.id) && identifier !== product.slug) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let visibleSince = 0;
    let counted = false;

    const clearTimer = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
    };
    const schedule = () => {
      clearTimer();
      if (counted || document.visibilityState !== "visible") return;
      visibleSince = Date.now();
      timer = setTimeout(() => {
        if (
          !counted &&
          isMeaningfulVisibleView({
            startedAt: visibleSince,
            now: Date.now(),
            wasHidden: document.visibilityState !== "visible",
          })
        ) {
          counted = true;
          void fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
            keepalive: true,
          }).catch(() => undefined);
        }
      }, PRODUCT_VIEW_THRESHOLD_MS);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearTimer();
        visibleSince = 0;
      } else {
        schedule();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();
    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [params.id, product]);

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
  const colorImages = useMemo(
    () =>
      variants
        .filter((variant) => variant.color === selectedColor)
        .flatMap((variant) => variant.images || []),
    [variants, selectedColor],
  );
  const gallery = useMemo(
    () =>
      [
        ...(selectedVariant?.images || []),
        ...colorImages,
        ...(product?.images || []),
      ].filter(
        (image, index, images) =>
          images.findIndex((item) => item.url === image.url) === index,
      ),
    [colorImages, product?.images, selectedVariantId, variants],
  );
  useEffect(() => {
    const next = gallery[0]?.url || product?.imageUrl || "";
    setActiveImage((current) =>
      gallery.some((image) => image.url === current) ? current : next,
    );
    setImageFailed(false);
    setImageZoom(1);
  }, [gallery, product?.imageUrl]);
  useEffect(() => {
    setQuantity((value) => Math.max(1, Math.min(value, Math.max(1, stock))));
  }, [stock, selectedVariantId]);

  const createBuyNowSession = async (
    variantId: number | null,
    nextQuantity: number,
  ) => {
    setBuyNowProcessing(true);
    const response = await fetch("/api/checkout/buy-now-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product?.id,
        variantId: variantId || undefined,
        quantity: nextQuantity,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBuyNowProcessing(false);
    if (!response.ok) {
      setError(data.message || "Không thể tạo phiên thanh toán.");
      return false;
    }
    router.replace(`/checkout?session=${encodeURIComponent(data.token)}`);
    return true;
  };

  useEffect(() => {
    if (
      searchParams.get("resume") !== "buy-now" ||
      !product ||
      isInitializing ||
      !isAuthenticated ||
      user?.role !== "CUSTOMER" ||
      resumeHandledRef.current ||
      buyNowProcessing
    ) {
      return;
    }
    const clearResume = () => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("resume");
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    };
    if (variants.length > 0 && !selectedVariant) {
      setError("Phân loại sản phẩm không tồn tại. Vui lòng chọn lại biến thể.");
      clearResume();
      return;
    }
    if (!stock) {
      setError("Sản phẩm đã hết hàng.");
      clearResume();
      return;
    }
    if (quantity > stock) {
      setQuantity(stock);
      setError(`Số lượng tối đa hiện có là ${stock}. Vui lòng kiểm tra lại.`);
      clearResume();
      return;
    }
    resumeHandledRef.current = true;
    void createBuyNowSession(selectedVariant?.id || null, quantity);
  }, [
    buyNowProcessing,
    isAuthenticated,
    isInitializing,
    pathname,
    product,
    quantity,
    router,
    searchParams,
    selectedVariant,
    stock,
    variants,
    user?.role,
  ]);

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
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("color", color);
    nextParams.delete("size");
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    setError("");
  };
  const selectSize = (variant: ProductVariantApiItem) => {
    setSelectedSize(variant.size || "");
    setSelectedVariantId(variant.id);
    const nextParams = new URLSearchParams(searchParams.toString());
    if (selectedColor) nextParams.set("color", selectedColor);
    if (variant.size) nextParams.set("size", variant.size);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
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
  const selectionUrl = (resumeBuyNow = false) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (selectedColor) nextParams.set("color", selectedColor);
    if (selectedSize) nextParams.set("size", selectedSize);
    nextParams.set("quantity", String(quantity));
    if (resumeBuyNow) nextParams.set("resume", "buy-now");
    return `${pathname}?${nextParams.toString()}`;
  };
  const addToCart = async () => {
    setMessage("");
    if (isInitializing) return;
    if (!isAuthenticated || user?.role !== "CUSTOMER")
      return router.push(buildLoginUrl(selectionUrl()));
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
    if (isInitializing) return;
    const productUrl = selectionUrl(true);
    if (!isAuthenticated || user?.role !== "CUSTOMER")
      return router.push(buildLoginUrl(productUrl));
    if (!requireVariant()) return;
    await createBuyNowSession(selectedVariant?.id || null, quantity);
  };
  const categoryHref = product.category?.id
    ? `/products?categoryId=${product.category.id}`
    : "/products";
  const setCheckoutQuantity = (nextQuantity: number) => {
    const normalized = Math.max(1, Math.min(nextQuantity, Math.max(1, stock)));
    setQuantity(normalized);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("quantity", String(normalized));
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };
  const canBuy = !variants.length
    ? Number(product.quantity) > 0
    : Boolean(selectedVariant && stock > 0);
  const descriptionHtml = product.descriptionHtml || product.description || "";
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
                      className={`size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white sm:size-[80px] ${activeImage === image.url ? "border-[#D96C8A]" : "border-transparent"}`}
                    >
                      <img
                        src={image.url}
                        alt={
                          image.altText || `${product.title} - ảnh ${index + 1}`
                        }
                        className="size-full object-contain p-1"
                        loading={index > 2 ? "lazy" : "eager"}
                      />
                    </button>
                  ))}
                </div>
                <div className="relative order-1 h-[420px] w-full flex-none overflow-hidden rounded-2xl bg-[#F5EEF0] sm:order-2 sm:h-[620px] sm:min-w-0 sm:flex-1 lg:h-[720px]">
                  <div className="absolute inset-0 overflow-auto">
                    {imageFailed ? (
                      <div className="flex size-full items-center justify-center px-8 text-center text-sm font-semibold text-[#998B91]">
                        Ảnh sản phẩm đang được cập nhật
                      </div>
                    ) : (
                      <div
                        className="flex min-h-full min-w-full items-start justify-center"
                        style={{ width: `${imageZoom * 100}%` }}
                      >
                        <img
                          src={activeImage || product.imageUrl}
                          alt={product.title}
                          onError={() => setImageFailed(true)}
                          className="block h-auto w-full max-w-none"
                          fetchPriority="high"
                        />
                      </div>
                    )}
                  </div>
                  {!imageFailed ? (
                    <div className="absolute bottom-3 left-3 z-10 flex w-fit items-center gap-1 rounded-xl bg-white/90 p-1 shadow-sm backdrop-blur">
                      <button
                        type="button"
                        aria-label="Thu nhỏ ảnh"
                        disabled={imageZoom <= 1}
                        onClick={() =>
                          setImageZoom((value) => Math.max(1, value - 0.25))
                        }
                        className="flex size-8 items-center justify-center rounded-lg text-[#6F6066] hover:bg-[#FCEEF3] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ZoomOut className="size-4" />
                      </button>
                      <span className="min-w-12 text-center text-xs font-bold text-[#6F6066]">
                        {Math.round(imageZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        aria-label="Phóng to ảnh"
                        disabled={imageZoom >= 2.5}
                        onClick={() =>
                          setImageZoom((value) => Math.min(2.5, value + 0.25))
                        }
                        className="flex size-8 items-center justify-center rounded-lg text-[#6F6066] hover:bg-[#FCEEF3] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ZoomIn className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Đặt lại kích thước ảnh"
                        onClick={() => setImageZoom(1)}
                        className="flex size-8 items-center justify-center rounded-lg text-[#6F6066] hover:bg-[#FCEEF3]"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                    </div>
                  ) : null}
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
              {descriptionHtml ? (
                <RichTextRenderer
                  html={descriptionHtml}
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
                            className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${selectedColor === color ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#6F6066] hover:border-[#F4B5C5] hover:bg-[#FFF7F9]"} disabled:cursor-not-allowed disabled:opacity-40`}
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
                              className={`min-h-11 min-w-12 rounded-lg border px-3 text-sm font-bold transition-colors ${selectedVariantId === variant.id ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#6F6066] hover:border-[#F4B5C5] hover:bg-[#FFF7F9]"} disabled:cursor-not-allowed disabled:bg-[#FAF8F8] disabled:text-[#998B91] disabled:line-through`}
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
              {(!variants.length || selectedVariant) && (
                <p
                  className={`mt-2 text-sm font-semibold ${!canBuy ? "text-[#C84F64]" : stock <= 3 ? "text-[#C84F64]" : "text-[#398866]"}`}
                >
                  {!canBuy
                    ? "Sản phẩm hiện đang hết hàng"
                    : stock <= 3
                      ? `Chỉ còn ${stock} sản phẩm`
                      : "Còn hàng"}
                </p>
              )}
              <div className="mt-5 flex items-center gap-4">
                <span className="text-sm font-bold">Số lượng</span>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#EAE1E4]">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1}
                    onClick={() => setCheckoutQuantity(quantity - 1)}
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
                    onClick={() => setCheckoutQuantity(quantity + 1)}
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
                  disabled={!canBuy || isInitializing || buyNowProcessing}
                  onClick={() => void addToCart()}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#D96C8A] px-4 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ShoppingBag className="size-4" />
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  disabled={!canBuy || isInitializing || buyNowProcessing}
                  onClick={() => void buyNow()}
                  className="h-12 rounded-xl bg-[#D96C8A] px-4 text-sm font-bold text-white hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {buyNowProcessing
                    ? "Đang chuyển đến thanh toán..."
                    : "Mua ngay"}
                </button>
              </div>
              <div className="mt-6 grid gap-3 border-t border-[#EAE1E4] pt-5 text-sm text-[#6F6066]">
                <p className="flex items-center gap-3">
                  <Truck className="size-4 text-[#D96C8A]" />
                  Giao hàng toàn quốc
                </p>
                <p className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-[#D96C8A]" />
                  Thanh toán an toàn theo cấu hình cửa hàng
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
          {descriptionHtml ? (
            <section className="mt-14 border-t border-[#EAE1E4] pt-8">
              <h2 className="text-xl font-extrabold">Thông tin sản phẩm</h2>
              <div
                className={`relative mt-5 max-w-3xl overflow-hidden transition-[max-height] duration-300 ${descriptionExpanded ? "max-h-[2000px]" : "max-h-64"}`}
              >
                <RichTextRenderer
                  html={descriptionHtml}
                  className="product-description text-[#6F6066]"
                />
                {!descriptionExpanded ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#FAF8F8] via-[#FAF8F8]/85 to-transparent"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-sm font-bold text-[#A43E5F] transition hover:text-[#D96C8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A]/30"
                aria-expanded={descriptionExpanded}
              >
                {descriptionExpanded ? "Thu gọn" : "Xem thêm"}
                <ChevronDown
                  className={`size-4 transition-transform ${descriptionExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </section>
          ) : null}
          <ProductReviews productIdentifier={String(params.id)} />
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
            disabled={!canBuy || isInitializing || buyNowProcessing}
            onClick={() => void addToCart()}
            className="h-11 rounded-xl border border-[#D96C8A] text-xs font-bold text-[#A43E5F] disabled:opacity-45"
          >
            Thêm vào giỏ
          </button>
          <button
            type="button"
            disabled={!canBuy || isInitializing || buyNowProcessing}
            onClick={() => void buyNow()}
            className="h-11 rounded-xl bg-[#D96C8A] text-xs font-bold text-white disabled:opacity-45"
          >
            {buyNowProcessing ? "Đang chuyển..." : "Mua ngay"}
          </button>
        </div>
      </div>
    </StorefrontShell>
  );
}
