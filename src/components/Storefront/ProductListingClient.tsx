"use client";

import ProductCard from "@/components/Storefront/ProductCard";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CategoryApiItem } from "@/interface/category";
import type { ProductListResponse } from "@/interface/product";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const genders = [
  { label: "Tất cả", value: "" },
  { label: "Nữ", value: "WOMEN" },
  { label: "Nam", value: "MEN" },
  { label: "Unisex", value: "UNISEX" },
];
const genderTitles: Record<string, string> = {
  WOMEN: "Thời trang nữ",
  MEN: "Thời trang nam",
  UNISEX: "Thời trang Unisex",
};

type ListingBanner = { title: string; description?: string | null; desktopImage?: string | null; mobileImage?: string | null; imageUrl?: string | null; imageAlt?: string | null; primaryCtaLabel?: string | null; primaryCtaUrl?: string | null };

export default function ProductListingClient() {
  const params = useSearchParams();
  const router = useRouter();
  const search = params.get("search") || "";
  const categoryId = params.get("categoryId") || "";
  const gender = params.get("gender") || "";
  const sort = params.get("sort") || "newest";
  const page = Math.max(1, Number(params.get("page") || 1));
  const [result, setResult] = useState<ProductListResponse | null>(null);
  const [categories, setCategories] = useState<CategoryApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(categoryId);
  const [draftGender, setDraftGender] = useState(gender);
  const [applying, setApplying] = useState(false);
  const [listingBanner, setListingBanner] = useState<ListingBanner | null>(null);
  useEffect(() => { fetch("/api/banners").then((response) => response.ok ? response.json() : Promise.reject()).then((data: { banner?: ListingBanner | null }) => setListingBanner(data.banner || null)).catch(() => undefined); }, []);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    const query = next.toString();
    router.push(query ? `/products?${query}` : "/products");
  };
  const reset = () => {
    const next = new URLSearchParams();
    if (search) next.set("search", search);
    if (sort !== "newest") next.set("sort", sort);
    router.push(`/products${next.toString() ? `?${next}` : ""}`);
    setDraftCategory("");
    setDraftGender("");
  };
  const applyDraft = () => {
    setApplying(true);
    const next = new URLSearchParams(params.toString());
    if (draftCategory) next.set("categoryId", draftCategory);
    else next.delete("categoryId");
    if (draftGender) next.set("gender", draftGender);
    else next.delete("gender");
    next.delete("page");
    router.push(`/products?${next.toString()}`);
  };
  const load = (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);
    const query = new URLSearchParams({
      limit: "12",
      page: String(page),
      sort,
    });
    if (search) query.set("search", search);
    if (categoryId) query.set("categoryId", categoryId);
    if (gender) query.set("gender", gender);
    fetch(`/api/products?${query}`, { signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: ProductListResponse) => {
        setResult(data);
        setFilterOpen(false);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") {
          setError(true);
          setResult(null);
        }
      })
      .finally(() => {
        setLoading(false);
        setApplying(false);
      });
  };
  useEffect(() => {
    fetch("/api/category?public=true")
      .then((response) => response.json())
      .then((data) => setCategories(data.data || data || []))
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    setDraftCategory(categoryId);
    setDraftGender(gender);
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [categoryId, gender, page, search, sort]);
  const categoryOptions = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.isActive !== false && (category._count?.products || 0) > 0,
      ),
    [categories],
  );
  const activeCategory = categories.find(
    (category) => String(category.id) === categoryId,
  );
  const activeCount = Number(Boolean(gender)) + Number(Boolean(categoryId));
  const title =
    activeCategory?.name || genderTitles[gender] || "Tất cả sản phẩm";
  const total = result?.pagination.total || 0;
  const filterChip = (label: string, key: string) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FCEEF3] px-3 py-1.5 text-xs font-semibold text-[#A43E5F]">
      {label}
      <button
        type="button"
        aria-label={`Xóa ${label}`}
        onClick={() => update(key, "")}
      >
        <X className="size-3" />
      </button>
    </span>
  );
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-xs text-[#998B91]">
          <Link href="/" className="hover:text-[#D96C8A]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>Sản phẩm
        </div>
        {listingBanner ? <section className="relative mt-6 overflow-hidden rounded-2xl bg-[#EDE3E1] p-6 sm:p-8"><picture>{listingBanner.mobileImage ? <source media="(max-width: 639px)" srcSet={listingBanner.mobileImage} /> : null}<img src={listingBanner.desktopImage || listingBanner.imageUrl || ""} alt={listingBanner.imageAlt || listingBanner.title} className="absolute inset-0 size-full object-cover" /></picture><div className="relative max-w-lg text-white drop-shadow"><h2 className="text-2xl font-extrabold">{listingBanner.title}</h2>{listingBanner.description ? <p className="mt-2 text-sm leading-6">{listingBanner.description}</p> : null}{listingBanner.primaryCtaLabel && listingBanner.primaryCtaUrl ? <Link href={listingBanner.primaryCtaUrl} className="mt-4 inline-flex rounded-lg bg-[#D96C8A] px-4 py-2 text-sm font-bold">{listingBanner.primaryCtaLabel}</Link> : null}</div></section> : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6F6066]">
              Khám phá những thiết kế mới nhất dành cho mọi phong cách.
            </p>
          </div>
          <p className="text-sm text-[#998B91]" aria-live="polite">
            {loading ? "Đang tải sản phẩm..." : `${total} sản phẩm`}
          </p>
        </div>
        <nav
          className="mt-7 flex gap-6 overflow-x-auto border-b border-[#EAE1E4] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Lọc theo giới tính"
        >
          {genders.map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => update("gender", option.value)}
              className={`relative shrink-0 pb-3 text-sm font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#D96C8A] ${gender === option.value ? "text-[#A43E5F] after:scale-x-100" : "text-[#6F6066] after:scale-x-0 hover:text-[#A43E5F]"}`}
            >
              {option.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#EAE1E4] bg-white px-4 text-sm font-bold"
          >
            <Filter className="size-4 text-[#D96C8A]" />
            Bộ lọc
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#D96C8A] text-[11px] text-white">
                {activeCount}
              </span>
            )}
          </button>
          <Select value={sort} onValueChange={(value) => update("sort", value)}>
            <SelectTrigger aria-label="Sắp xếp" className="w-44">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Bộ lọc</h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-bold text-[#D96C8A]"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="mt-5 border-y border-[#EAE1E4] py-5">
              <p className="text-sm font-bold">Giới tính</p>
              <div className="mt-3 grid gap-1">
                {genders.map((option) => (
                  <button
                    key={option.value || "all"}
                    type="button"
                    onClick={() => update("gender", option.value)}
                    className={`flex min-h-10 items-center justify-between text-left text-sm ${gender === option.value ? "font-bold text-[#A43E5F]" : "text-[#6F6066] hover:text-[#D96C8A]"}`}
                  >
                    {option.label}
                    {gender === option.value && (
                      <span className="size-1.5 rounded-full bg-[#D96C8A]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-b border-[#EAE1E4] py-5">
              <p className="text-sm font-bold">Danh mục</p>
              <div className="mt-3 grid gap-1">
                {categoryOptions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => update("categoryId", String(category.id))}
                    className={`flex min-h-10 items-center justify-between gap-2 text-left text-sm ${categoryId === String(category.id) ? "font-bold text-[#A43E5F]" : "text-[#6F6066] hover:text-[#D96C8A]"}`}
                  >
                    <span className="truncate">{category.name}</span>
                    <span className="text-xs text-[#998B91]">
                      {category._count?.products}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {search && filterChip(`Tìm: ${search}`, "search")}
                {gender && filterChip(genderTitles[gender] || gender, "gender")}
                {activeCategory &&
                  filterChip(activeCategory.name, "categoryId")}
                {(gender || categoryId || search) && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1 px-2 text-xs font-bold text-[#D96C8A]"
                  >
                    <RotateCcw className="size-3" />
                    Xóa tất cả
                  </button>
                )}
              </div>
              <Select
                value={sort}
                onValueChange={(value) => update("sort", value)}
              >
                <SelectTrigger
                  aria-label="Sắp xếp"
                  className="hidden w-48 sm:flex"
                >
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error ? (
              <div className="border border-[#EAE1E4] bg-white px-6 py-16 text-center">
                <p className="font-bold">Không thể tải danh sách sản phẩm.</p>
                <p className="mt-2 text-sm text-[#6F6066]">Vui lòng thử lại.</p>
                <button
                  type="button"
                  onClick={() => load()}
                  className="mt-5 min-h-11 bg-[#D96C8A] px-5 text-sm font-bold text-white"
                >
                  Thử lại
                </button>
              </div>
            ) : loading && !result ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="storefront-skeleton aspect-[4/5] rounded-none" />
                    <Skeleton className="storefront-skeleton h-4 w-3/4" />
                    <Skeleton className="storefront-skeleton h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : result?.data.length ? (
              <>
                <div className="mb-3 min-h-5" aria-live="polite">
                  {loading && (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#A43E5F]">
                      <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                      Đang cập nhật sản phẩm...
                    </span>
                  )}
                </div>
                <div
                  aria-busy={loading}
                  className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4 ${loading ? "opacity-60" : ""}`}
                >
                  {result.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    aria-label="Trang trước"
                    disabled={page <= 1}
                    onClick={() => update("page", String(page - 1))}
                    className="flex size-10 items-center justify-center rounded-full border border-[#EAE1E4] bg-white transition-colors hover:border-[#D96C8A] hover:text-[#D96C8A] disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-sm font-bold">
                    {page} / {result.pagination.totalPage || 1}
                  </span>
                  <button
                    aria-label="Trang sau"
                    disabled={page >= result.pagination.totalPage}
                    onClick={() => update("page", String(page + 1))}
                    className="flex size-10 items-center justify-center rounded-full border border-[#EAE1E4] bg-white transition-colors hover:border-[#D96C8A] hover:text-[#D96C8A] disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="border border-dashed border-[#EAE1E4] bg-white px-6 py-20 text-center">
                <p className="font-bold">Không tìm thấy sản phẩm phù hợp</p>
                <p className="mt-2 text-sm text-[#6F6066]">
                  Hãy thử thay đổi hoặc xóa bớt bộ lọc để xem thêm sản phẩm.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="min-h-11 rounded-xl bg-[#D96C8A] px-5 text-sm font-bold text-white"
                  >
                    Xóa bộ lọc
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/products")}
                    className="min-h-11 rounded-xl border border-[#EAE1E4] px-5 text-sm font-bold"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent
          side="right"
          className="h-dvh w-[min(92vw,380px)] bg-[#FAF8F8] p-0"
        >
          <SheetTitle className="border-b border-[#EAE1E4] px-5 py-5 text-left">
            Bộ lọc sản phẩm
          </SheetTitle>
          <SheetDescription className="sr-only">
            Lọc theo giới tính và danh mục
          </SheetDescription>
          <div className="overflow-y-auto px-5 pb-28 pt-3">
            <p className="py-3 text-sm font-bold">Giới tính</p>
            {genders.map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                onClick={() => setDraftGender(option.value)}
                className={`flex min-h-11 w-full items-center justify-between border-b border-[#EAE1E4] text-left text-sm ${draftGender === option.value ? "font-bold text-[#A43E5F]" : "text-[#6F6066]"}`}
              >
                {option.label}
                {draftGender === option.value && (
                  <span className="size-2 rounded-full bg-[#D96C8A]" />
                )}
              </button>
            ))}
            <p className="py-3 text-sm font-bold">Danh mục</p>
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setDraftCategory(String(category.id))}
                className={`flex min-h-11 w-full items-center justify-between border-b border-[#EAE1E4] text-left text-sm ${draftCategory === String(category.id) ? "font-bold text-[#A43E5F]" : "text-[#6F6066]"}`}
              >
                {category.name}
                {draftCategory === String(category.id) && (
                  <span className="size-2 rounded-full bg-[#D96C8A]" />
                )}
              </button>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t border-[#EAE1E4] bg-[#FAF8F8] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                setDraftCategory("");
                setDraftGender("");
              }}
              className="min-h-11 flex-1 rounded-xl border border-[#EAE1E4] bg-white text-sm font-bold"
            >
              Đặt lại
            </button>
            <button
              type="button"
              disabled={applying}
              onClick={applyDraft}
              className="min-h-11 flex-1 rounded-xl bg-[#D96C8A] text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {applying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                  Đang tải...
                </span>
              ) : (
                `Xem ${total} sản phẩm`
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </StorefrontShell>
  );
}
