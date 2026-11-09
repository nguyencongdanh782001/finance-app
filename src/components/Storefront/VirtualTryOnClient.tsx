"use client";

/* eslint-disable @next/next/no-img-element */

import StorefrontShell from "@/components/Storefront/StorefrontShell";
import {
  Camera,
  Check,
  Download,
  ImagePlus,
  Info,
  Loader2,
  Search,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Product = {
  id: number;
  title: string;
  imageUrl: string;
  sellPrice: number | string;
  category?: { name?: string | null; tryOnCategory?: string | null } | null;
};

type GarmentCategory =
  | "all"
  | "UPPER_BODY"
  | "LOWER_BODY"
  | "DRESSES"
  | "ACCESSORIES"
  | "SHOES"
  | "NOT_SUPPORTED"
  | "UNKNOWN";

const garmentCategoryLabels: Record<GarmentCategory, string> = {
  all: "Tất cả",
  UPPER_BODY: "Áo",
  LOWER_BODY: "Quần · chân váy",
  DRESSES: "Đầm · váy liền",
  SHOES: "Dép · giày",
  ACCESSORIES: "Nón · phụ kiện",
  NOT_SUPPORTED: "Không hỗ trợ",
  UNKNOWN: "Chưa phân loại",
};

const getGarmentCategory = (
  product: Product,
): Exclude<GarmentCategory, "all"> =>
  product.category?.tryOnCategory &&
  product.category.tryOnCategory in garmentCategoryLabels
    ? (product.category.tryOnCategory as Exclude<GarmentCategory, "all">)
    : "UNKNOWN";

const formatPrice = (value: number | string) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value))}đ`;

const StepLabel = ({
  number,
  children,
}: {
  number: string;
  children: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex size-7 items-center justify-center rounded-full bg-[#FCEEF3] text-xs font-extrabold text-[#A43E5F]">
      {number}
    </span>
    <span className="text-sm font-extrabold text-[#3B2D32]">{children}</span>
  </div>
);

export default function VirtualTryOnClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [garmentFilter, setGarmentFilter] = useState<GarmentCategory>("all");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch("/api/products?limit=100&sort=newest", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải sản phẩm.");
        return (await response.json()) as { data?: Product[] };
      })
      .then((data) => {
        if (!active) return;
        const available = (data.data || []).filter((item) => item.imageUrl);
        setProducts(available);
        setSelectedProductId(available[0]?.id || null);
      })
      .catch((cause) => {
        if (
          active &&
          !(cause instanceof Error && cause.name === "AbortError")
        ) {
          setError("Không thể tải danh sách sản phẩm.");
        }
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!resultUrl) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [resultUrl]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  const visibleProducts = useMemo(() => {
    const query = productQuery.trim().toLocaleLowerCase("vi");
    return products.filter((product) => {
      const matchesQuery =
        !query || product.title.toLocaleLowerCase("vi").includes(query);
      const matchesCategory =
        garmentFilter === "all" ||
        getGarmentCategory(product) === garmentFilter;
      return matchesQuery && matchesCategory;
    });
  }, [garmentFilter, productQuery, products]);

  const chooseFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    setError("");
    setResultUrl("");
    if (!["image/jpeg", "image/png"].includes(nextFile.type)) {
      setError("Vui lòng chọn ảnh JPG hoặc PNG.");
      return;
    }
    if (nextFile.size > 8 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 8MB.");
      return;
    }
    setFile(nextFile);
  };

  const isSupportedProduct = (product: Product) =>
    ["UPPER_BODY", "LOWER_BODY", "DRESSES", "ACCESSORIES"].includes(
      getGarmentCategory(product),
    );

  const generate = async () => {
    if (!file || !selectedProductId) {
      setError("Hãy tải ảnh và chọn một sản phẩm trước nhé.");
      return;
    }
    if (selectedProduct && !isSupportedProduct(selectedProduct)) {
      setError(
        "Sản phẩm này chưa được AI hiện tại hỗ trợ. Hãy chọn áo, nón, quần, đầm hoặc váy.",
      );
      return;
    }
    setGenerating(true);
    setError("");
    setResultUrl("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("productId", String(selectedProductId));
      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        body,
      });
      const data = (await response.json().catch(() => null)) as {
        imageUrl?: string;
        message?: string;
      } | null;
      if (!response.ok || !data?.imageUrl) {
        throw new Error(data?.message || "Không thể tạo ảnh thử đồ.");
      }
      setResultUrl(data.imageUrl);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể tạo ảnh thử đồ.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#FFF1F5] via-[#FFF9FA] to-[#F8EFF2] px-5 py-7 sm:px-8 sm:py-9">
          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-[#E7A0B4]/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-[#A43E5F] shadow-sm">
              <Sparkles className="size-3.5" /> AI thử đồ miễn phí
            </div>
            <h1 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight text-[#3A2930] sm:text-5xl">
              Thấy mình trong bộ đồ bạn thích.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#76666C] sm:text-base">
              Tải ảnh toàn thân, chọn một sản phẩm và để AI tạo ảnh thử đồ cho
              bạn.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[#8E6672]">
              <span className="rounded-full bg-white/75 px-3 py-2">
                1 ảnh của bạn
              </span>
              <span className="rounded-full bg-white/75 px-3 py-2">
                1 sản phẩm
              </span>
              <span className="rounded-full bg-white/75 px-3 py-2">
                Không cần đăng nhập
              </span>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-[26px] border border-[#EADDE1] bg-white p-4 shadow-[0_12px_40px_rgba(77,47,58,0.06)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <StepLabel number="1">Ảnh của bạn</StepLabel>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-[#A43E5F] transition hover:bg-[#FFF3F6]"
                >
                  <Upload className="size-3.5" /> Đổi ảnh
                </button>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8B7A80]">
              Ảnh đứng thẳng, thấy trọn người sẽ cho kết quả tốt hơn.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                chooseFile(event.dataTransfer.files?.[0]);
              }}
              className={`group relative mt-5 flex aspect-4/5 w-full items-center justify-center overflow-hidden rounded-[22px] border-2 text-center transition ${previewUrl ? "border-[#E8CBD4] bg-[#F8F1F2]" : dragActive ? "border-[#D96C8A] bg-[#FFF0F4]" : "border-dashed border-[#E8CBD4] bg-[#FFF9FA] hover:border-[#D96C8A] hover:bg-[#FFF4F7]"}`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Ảnh bạn đã tải lên"
                    className="size-full object-contain"
                  />
                  <span className="absolute inset-x-3 bottom-3 rounded-xl bg-[#3A2930]/75 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                    Bấm để chọn ảnh khác
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center px-5">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#D96C8A] shadow-sm">
                    <ImagePlus className="size-6" />
                  </span>
                  <span className="mt-4 text-sm font-extrabold text-[#3B2D32]">
                    Tải ảnh toàn thân
                  </span>
                  <span className="mt-1 text-xs text-[#8B7A80]">
                    JPG hoặc PNG · tối đa 8MB
                  </span>
                </span>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              capture="user"
              className="hidden"
              onChange={(event) => {
                chooseFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#8B7A80]">
              <Camera className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Trên điện thoại, bạn có thể chụp trực tiếp. Tránh ảnh có nhiều
                người hoặc bị che khuất.
              </span>
            </div>
          </section>

          <section className="rounded-[26px] border border-[#EADDE1] bg-white p-4 shadow-[0_12px_40px_rgba(77,47,58,0.06)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <StepLabel number="2">Chọn sản phẩm</StepLabel>
              {!loadingProducts && products.length > 0 && (
                <span className="text-xs font-semibold text-[#A39197]">
                  {productQuery.trim()
                    ? `${visibleProducts.length}/${products.length} mẫu`
                    : `${products.length} mẫu`}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8B7A80]">
              Chạm vào sản phẩm bạn muốn mặc thử.
            </p>

            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#B39DA4]" />
              <input
                type="search"
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="Tìm sản phẩm bạn thích..."
                aria-label="Tìm sản phẩm"
                className="h-11 w-full rounded-2xl border border-[#EADDE1] bg-[#FCFAFA] pl-10 pr-4 text-sm text-[#3B2D32] outline-none transition placeholder:text-[#B39DA4] focus:border-[#D96C8A] focus:bg-white focus:ring-4 focus:ring-[#FCEEF3]"
              />
            </label>

            <div
              className="mt-3 flex gap-2 overflow-x-auto pb-1"
              aria-label="Lọc loại quần áo"
            >
              {(Object.keys(garmentCategoryLabels) as GarmentCategory[]).map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setGarmentFilter(category)}
                    className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-extrabold transition ${garmentFilter === category ? "bg-[#D96C8A] text-white" : "bg-[#FFF3F6] text-[#A43E5F] hover:bg-[#FCE0E8]"}`}
                  >
                    {garmentCategoryLabels[category]}
                  </button>
                ),
              )}
            </div>
            <p className="mt-2 text-11px leading-5 text-[#A39197]">
              AI hiện hỗ trợ thử <strong>áo, nón, quần, đầm và váy</strong>. Sản phẩm khác
              được đánh dấu rõ để bạn không chọn nhầm.
            </p>

            {loadingProducts ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="aspect-4/5 animate-pulse rounded-2xl bg-[#F6EEF0]"
                  />
                ))}
              </div>
            ) : products.length && visibleProducts.length ? (
              <div className="mt-4 grid max-h-105 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => {
                  const selected = product.id === selectedProductId;
                  return (
                    <button
                      type="button"
                      key={product.id}
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setResultUrl("");
                        setError("");
                      }}
                      className={`group overflow-hidden rounded-2xl border-2 text-left transition ${selected ? "border-[#D96C8A] bg-[#FFF3F6] shadow-[0_8px_20px_rgba(217,108,138,0.12)]" : "border-transparent bg-[#FAF8F8] hover:border-[#E8CBD4]"}`}
                    >
                      <div className="relative aspect-4/5 overflow-hidden bg-[#F1EAEC]">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          loading="lazy"
                          className="size-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        {selected && (
                          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-[#D96C8A] text-white shadow-sm">
                            <Check className="size-4" />
                          </span>
                        )}
                        {!isSupportedProduct(product) && (
                          <span className="absolute inset-0 flex items-center justify-center bg-[#3A2930]/45 px-2 text-center text-11px font-extrabold text-white">
                            Chưa hỗ trợ thử đồ
                          </span>
                        )}
                        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-10px font-extrabold text-[#A43E5F] shadow-sm">
                          {garmentCategoryLabels[getGarmentCategory(product)]}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <p className="line-clamp-2 min-h-8 text-xs font-bold leading-4 text-[#3B2D32]">
                          {product.title}
                        </p>
                        <p className="mt-1 text-xs font-extrabold text-[#A43E5F]">
                          {formatPrice(product.sellPrice)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : products.length ? (
              <div className="mt-5 rounded-2xl bg-[#FFF9FA] p-6 text-center">
                <p className="text-sm font-bold text-[#5F4B53]">
                  Không tìm thấy sản phẩm phù hợp.
                </p>
                <button
                  type="button"
                  onClick={() => setProductQuery("")}
                  className="mt-2 text-xs font-extrabold text-[#A43E5F] hover:underline"
                >
                  Xem lại tất cả sản phẩm
                </button>
              </div>
            ) : (
              <p className="mt-6 rounded-2xl bg-[#FFF9FA] p-6 text-center text-sm text-[#8B7A80]">
                Chưa có sản phẩm phù hợp.
              </p>
            )}

            {selectedProduct && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#FFF8FA] p-3">
                <img
                  src={selectedProduct.imageUrl}
                  alt=""
                  className="size-12 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="text-11px font-semibold text-[#A39197]">
                    Đang chọn
                  </p>
                  <p className="truncate text-sm font-extrabold text-[#3B2D32]">
                    {selectedProduct.title}
                  </p>
                </div>
                <Check className="ml-auto size-5 shrink-0 text-[#D96C8A]" />
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-2xl bg-[#FFF1F1] px-4 py-3 text-sm font-semibold leading-5 text-[#B44C4C]"
              >
                {error}
              </p>
            )}

            {generating && (
              <div
                role="status"
                className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FFF8FA] px-4 py-3 text-sm text-[#765E67]"
              >
                <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-[#D96C8A]" />
                <span>
                  <strong className="text-[#3B2D32]">
                    AI đang xử lý ảnh...
                  </strong>
                  <br />
                  Có thể cần chờ một chút vì đây là phiên bản miễn phí.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => void generate()}
              disabled={
                generating ||
                !file ||
                !selectedProductId ||
                Boolean(selectedProduct && !isSupportedProduct(selectedProduct))
              }
              className="sticky bottom-3 z-10 mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D96C8A] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(217,108,138,0.28)] transition hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang tạo ảnh...
                </>
              ) : (
                <>
                  <WandSparkles className="size-4" /> Thử đồ ngay
                </>
              )}
            </button>
          </section>
        </div>

        {resultUrl && (
          <section
            ref={resultRef}
            className="mt-5 scroll-mt-5 rounded-[26px] border border-[#EADDE1] bg-white p-4 shadow-[0_12px_40px_rgba(77,47,58,0.06)] sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#D96C8A]">
                  <Sparkles className="size-3.5" /> Kết quả của bạn
                </div>
                <h2 className="mt-1 text-xl font-black text-[#3A2930] sm:text-2xl">
                  Bạn thấy thế nào?
                </h2>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={() => setResultUrl("")}
                  className="rounded-full border border-[#E8CBD4] px-3.5 py-2 text-xs font-bold text-[#A43E5F] transition hover:bg-[#FFF3F6] sm:whitespace-nowrap"
                >
                  Thử bộ khác
                </button>
                <a
                  href={resultUrl}
                  download="anh-thu-do.png"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#3A2930] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#513B44] sm:whitespace-nowrap"
                >
                  <Download className="size-3.5" /> Lưu ảnh
                </a>
              </div>
            </div>
            <div className="mt-5 flex justify-center overflow-hidden rounded-[22px] bg-[#F8F1F2] p-2 sm:p-5">
              <img
                src={resultUrl}
                alt={`Ảnh thử đồ ${selectedProduct?.title || "sản phẩm"}`}
                className="max-h-180 max-w-full rounded-2xl object-contain"
              />
            </div>
            <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs leading-5 text-[#8B7A80]">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Ảnh AI chỉ mang tính minh họa. Màu sắc và độ vừa vặn thực tế có
              thể khác.
            </p>
          </section>
        )}
      </main>
    </StorefrontShell>
  );
}
