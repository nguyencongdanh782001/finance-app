"use client";
/* eslint-disable @next/next/no-img-element */

import { Search, X, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Suggestion = {
  id: number;
  name: string;
  slug?: string | null;
  image: { url: string; alt: string };
  minPrice: number;
  maxPrice: number;
  isInStock: boolean;
  availableColorCount: number;
};
type SuggestionResponse = { query: string; items: Suggestion[]; total: number };
const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function SuggestionRows({
  items,
  loading,
  error,
  query,
  total,
  activeIndex,
  onSelect,
  onHover,
}: {
  items: Suggestion[];
  loading: boolean;
  error: boolean;
  query: string;
  total: number;
  activeIndex: number;
  onSelect: (item: Suggestion) => void;
  onHover: (index: number) => void;
}) {
  if (loading)
    return (
      <div className="grid gap-2 p-3" aria-busy="true">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex gap-3 p-2">
            <div className="storefront-skeleton size-14 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="storefront-skeleton h-4 w-4/5" />
              <div className="storefront-skeleton h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  if (error)
    return (
      <div className="px-5 py-8 text-center text-sm text-[#6F6066]">
        <p>Không thể tải gợi ý sản phẩm.</p>
        <p className="mt-1 text-xs text-[#998B91]">
          Bạn vẫn có thể nhấn Enter để xem kết quả.
        </p>
      </div>
    );
  if (!items.length)
    return (
      <div className="px-5 py-8 text-center text-sm text-[#6F6066]">
        Không tìm thấy sản phẩm phù hợp với “{query}”.
      </div>
    );
  return (
    <>
      <div
        role="listbox"
        aria-label="Sản phẩm gợi ý"
        className="max-h-[min(55vh,360px)] overflow-y-auto p-2"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            id={`product-suggestion-${item.id}`}
            type="button"
            role="option"
            aria-selected={activeIndex === index}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(item)}
            className={`flex min-h-16 w-full items-center gap-3 p-2 text-left transition ${activeIndex === index ? "bg-[#FCEEF3]" : "hover:bg-[#FCEEF3]"}`}
          >
            <div className="size-14 shrink-0 overflow-hidden bg-[#F3EDEF]">
              <img
                src={item.image.url}
                alt={item.image.alt}
                className="size-full object-cover"
              />
            </div>
            <span className="min-w-0 flex-1">
              <span className="block line-clamp-2 text-sm font-semibold text-[#2D2226]">
                {item.name}
              </span>
              <span className="mt-1 block text-xs font-bold text-[#A43E5F]">
                {item.minPrice === item.maxPrice
                  ? money(item.minPrice)
                  : `${money(item.minPrice)} – ${money(item.maxPrice)}`}
              </span>
              <span className="mt-0.5 block text-[11px] text-[#998B91]">
                {item.availableColorCount > 0
                  ? `${item.availableColorCount} màu`
                  : item.isInStock
                    ? "Còn hàng"
                    : "Hết hàng"}
              </span>
            </span>
          </button>
        ))}
      </div>
      <Link
        href={`/products?search=${encodeURIComponent(query)}`}
        className="flex min-h-11 items-center justify-between border-t border-[#EAE1E4] px-4 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3]"
      >
        Xem tất cả {total} kết quả <ArrowRight className="size-4" />
      </Link>
    </>
  );
}

export default function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const desktopRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const normalized = normalize(query);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        desktopRef.current &&
        !desktopRef.current.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
    setOpen(false);
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    setActiveIndex(-1);
    if (normalized.length < 2) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      setError(false);
      return;
    }
    const timer = window.setTimeout(() => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setLoading(true);
      setError(false);
      setOpen(true);
      fetch(
        `/api/products/search-suggestions?q=${encodeURIComponent(normalized)}&limit=6`,
        { signal: controller.signal },
      )
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data: SuggestionResponse) => {
          if (normalize(query) !== data.query) return;
          setItems(data.items);
          setTotal(data.total);
        })
        .catch((reason) => {
          if (reason.name !== "AbortError") {
            setError(true);
            setItems([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      requestRef.current?.abort();
    };
  }, [normalized]);
  const searchAll = () => {
    const value = normalize(query);
    if (value.length < 1) return;
    setOpen(false);
    setMobileOpen(false);
    router.push(`/products?search=${encodeURIComponent(value)}`);
  };
  const selectItem = (item: Suggestion) => {
    setOpen(false);
    setMobileOpen(false);
    router.push(`/products/${item.slug || item.id}`);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(items.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(-1, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        selectItem(items[activeIndex]);
      } else {
        searchAll();
      }
    }
  };
  const input = (mobile = false) => (
    <div
      className={`flex items-center gap-2 ${mobile ? "h-11 border-b border-[#D8CDD1]" : "h-10 border-b border-[#D8CDD1] focus-within:border-[#D96C8A]"}`}
    >
      <Search className="size-4 shrink-0 text-[#9C8E93]" />
      <input
        autoFocus={mobile}
        value={query}
        onFocus={() => normalized.length >= 2 && setOpen(true)}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls="product-search-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0
            ? `product-suggestion-${items[activeIndex]?.id}`
            : undefined
        }
        placeholder="Tìm kiếm sản phẩm"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9C8E93]"
      />
      {query && (
        <button
          type="button"
          aria-label="Xóa tìm kiếm"
          onClick={() => setQuery("")}
          className="flex size-8 items-center justify-center text-[#9C8E93] hover:text-[#D96C8A]"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
  return (
    <>
      <div
        ref={desktopRef}
        className="relative ml-auto hidden max-w-[280px] flex-1 lg:block"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            searchAll();
          }}
        >
          {input()}
        </form>
        {open && !mobileOpen && normalized.length >= 2 && (
          <div
            id="product-search-suggestions"
            className="absolute left-0 right-0 top-11 z-50 border border-[#EAE1E4] bg-white shadow-[0_18px_40px_rgba(45,34,38,0.12)]"
          >
            <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-[#998B91]">
              Sản phẩm gợi ý
            </p>
            <SuggestionRows
              items={items}
              loading={loading}
              error={error}
              query={normalized}
              total={total}
              activeIndex={activeIndex}
              onSelect={selectItem}
              onHover={setActiveIndex}
            />
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="Mở tìm kiếm"
        onClick={() => setMobileOpen(true)}
        className="flex size-11 items-center justify-center text-[#6F6066] hover:text-[#D96C8A] lg:hidden"
      >
        <Search className="size-5" />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF8F8] p-5 lg:hidden">
          <div className="sticky top-0 flex items-center gap-2 bg-[#FAF8F8] pb-3">
            <button
              type="button"
              aria-label="Đóng tìm kiếm"
              onClick={() => setMobileOpen(false)}
              className="flex size-10 items-center justify-center"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  searchAll();
                }}
              >
                {input(true)}
              </form>
            </div>
          </div>
          <div
            id="product-search-suggestions"
            className="mx-auto max-w-2xl overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <p className="pt-5 text-[11px] font-bold uppercase tracking-wider text-[#998B91]">
              Sản phẩm gợi ý
            </p>
            <SuggestionRows
              items={items}
              loading={loading}
              error={error}
              query={normalized}
              total={total}
              activeIndex={activeIndex}
              onSelect={selectItem}
              onHover={setActiveIndex}
            />
          </div>
        </div>
      )}
    </>
  );
}
