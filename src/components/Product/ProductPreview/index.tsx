"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatPreviewPrice,
  getDefaultPreviewSelection,
  getPreviewColor,
  getPreviewSizesForColor,
  resolvePreviewImages,
  resolvePreviewVariant,
  type ProductPreviewSelection,
  type ProductPreviewViewModel,
} from "@/lib/products/product-preview";

type ProductPreviewProps = {
  product: ProductPreviewViewModel;
  mode: "admin-preview";
  layout: "desktop" | "mobile";
};

const genderLabels = {
  WOMEN: "Nữ",
  MEN: "Nam",
  UNISEX: "Unisex",
  KIDS: "Trẻ em",
} as const;

export default function ProductPreview({
  product,
  mode: _mode,
  layout,
}: ProductPreviewProps) {
  const defaults = useMemo(
    () => getDefaultPreviewSelection(product),
    [product],
  );
  const [selection, setSelection] =
    useState<ProductPreviewSelection>(defaults);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [previewMessage, setPreviewMessage] = useState("");
  const isMobileFrame = layout === "mobile";
  const selectedColor = getPreviewColor(product, selection.colorId);
  const sizes = getPreviewSizesForColor(product, selection.colorId);
  const selectedVariant = resolvePreviewVariant(product, selection);
  const gallery = resolvePreviewImages(product, selection);
  const gallerySignature = gallery.map((image) => image.clientId).join("|");

  useEffect(() => {
    const currentColor = getPreviewColor(product, selection.colorId);
    const currentVariant = resolvePreviewVariant(product, selection);
    if (!currentColor || !currentVariant) setSelection(defaults);
  }, [defaults, product, selection]);

  useEffect(() => {
    setMainImageIndex(0);
  }, [gallerySignature]);

  const selectColor = (colorId: string) => {
    const available = getPreviewSizesForColor(product, colorId);
    const nextVariant =
      available.find((variant) => variant.stock > 0) || available[0];
    setSelection({
      colorId,
      variantClientId: nextVariant?.clientId || null,
    });
    setPreviewMessage("");
  };

  const description = product.description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  return (
    <article
      className={cn(
        "mx-auto w-full overflow-hidden bg-white text-slate-900",
        isMobileFrame
          ? "max-w-97.5 rounded-[28px] border-8 border-slate-900 shadow-xl"
          : "rounded-2xl border border-(--admin-border)",
      )}
      aria-label="Xem trước trang chi tiết sản phẩm"
    >
      {isMobileFrame ? (
        <div className="mx-auto mt-2 h-1.5 w-20 rounded-full bg-slate-700" />
      ) : null}
      <div className={cn("px-4 pt-4", !isMobileFrame && "sm:px-6 sm:pt-5")}>
        <nav
          aria-label="Đường dẫn danh mục xem trước"
          className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-500"
        >
          <span>Trang chủ</span>
          {[...product.categoryPath, product.title].map((part, index) => (
            <span
              key={`${index}-${part}`}
              className="inline-flex min-w-0 items-center gap-1"
            >
              <ChevronRight className="size-3 shrink-0" />
              <span className="max-w-52 truncate">{part}</span>
            </span>
          ))}
          {!product.categoryPath.length ? (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <ChevronRight className="size-3" /> Chưa chọn danh mục
            </span>
          ) : null}
        </nav>
      </div>

      <div
        className={cn(
          "grid gap-6 p-4",
          !isMobileFrame && "sm:p-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:gap-9",
        )}
      >
        <ProductPreviewGallery
          images={gallery}
          index={mainImageIndex}
          onIndexChange={setMainImageIndex}
          compact={isMobileFrame}
        />

        <section className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A43E5F]">
            {product.brand || product.categoryPath.at(-1) || "Sản phẩm mới"}
          </p>
          <h1
            className={cn(
              "mt-2 break-words font-extrabold leading-tight text-slate-950",
              isMobileFrame ? "text-2xl" : "text-2xl sm:text-3xl",
            )}
          >
            {product.title}
          </h1>
          <p className="mt-3 text-2xl font-extrabold text-[#A43E5F]">
            {formatPreviewPrice(product, selection)}
          </p>

          {product.colors.length ? (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold">Màu sắc</p>
                <p className="text-xs text-slate-500">
                  {selectedColor?.name || "Chưa chọn"}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const active = color.clientId === selection.colorId;
                  return (
                    <button
                      key={color.clientId}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectColor(color.clientId)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                        active
                          ? "border-[#D96C8A] bg-[#FFF3F6] text-[#7A2944] ring-2 ring-[#D96C8A]/15"
                          : "border-slate-200 hover:border-[#D96C8A]/60",
                      )}
                    >
                      <span
                        className="size-5 rounded-full border border-black/10 bg-slate-100"
                        style={color.code ? { backgroundColor: color.code } : undefined}
                      />
                      {color.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {sizes.length ? (
            <div className="mt-5">
              <p className="text-sm font-bold">Kích thước</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((variant) => {
                  const selected =
                    variant.clientId === selection.variantClientId;
                  const outOfStock = variant.stock === 0;
                  return (
                    <button
                      key={variant.clientId}
                      type="button"
                      disabled={outOfStock}
                      aria-pressed={selected}
                      title={outOfStock ? "Hết hàng" : undefined}
                      onClick={() => {
                        setSelection((current) => ({
                          ...current,
                          variantClientId: variant.clientId,
                        }));
                        setPreviewMessage("");
                      }}
                      className={cn(
                        "flex min-h-10 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-bold transition-colors",
                        selected
                          ? "border-[#D96C8A] bg-[#D96C8A] text-white"
                          : "border-slate-200 bg-white hover:border-[#D96C8A]",
                        outOfStock &&
                          "cursor-not-allowed bg-slate-100 text-slate-400 line-through hover:border-slate-200",
                      )}
                    >
                      {variant.sizeName}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm">
            {selectedVariant ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500">
                  SKU: <strong className="text-slate-800">{selectedVariant.sku || "Chưa có SKU"}</strong>
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-semibold",
                    selectedVariant.stock > 0 ? "text-emerald-700" : "text-red-600",
                  )}
                >
                  <PackageCheck className="size-4" />
                  {selectedVariant.stock > 0
                    ? `Còn ${selectedVariant.stock.toLocaleString("vi-VN")} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>
            ) : (
              <p className="text-slate-600">
                {product.hasVariants
                  ? "Chọn màu và kích thước để xem tồn kho."
                  : product.baseStock > 0
                    ? `Còn ${product.baseStock.toLocaleString("vi-VN")} sản phẩm`
                    : "Hết hàng"}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="brand"
            className="mt-5 h-12 w-full rounded-xl text-base"
            disabled={
              product.status === "DISCONTINUED" ||
              (product.hasVariants
                ? !selectedVariant || selectedVariant.stock === 0
                : product.baseStock === 0)
            }
            onClick={() =>
              setPreviewMessage(
                "Đây là chế độ xem trước. Sản phẩm chưa được thêm vào giỏ hàng.",
              )
            }
          >
            <ShoppingBag className="size-5" /> Thêm vào giỏ hàng
          </Button>
          {previewMessage ? (
            <p role="status" className="mt-2 text-center text-xs text-[#7A2944]">
              {previewMessage}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-slate-400">
              Xem trước — không tạo đơn hàng
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs">
            <div>
              <dt className="text-slate-400">Danh mục</dt>
              <dd className="mt-1 font-semibold text-slate-700">
                {product.categoryPath.join(" / ") || "Chưa chọn"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Đối tượng</dt>
              <dd className="mt-1 font-semibold text-slate-700">
                {product.gender ? genderLabels[product.gender] : "Không giới hạn"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className={cn("border-t border-slate-100 p-4", !isMobileFrame && "sm:p-6")}>
        <h2 className="text-lg font-extrabold">Mô tả sản phẩm</h2>
        {description ? (
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
            {description.split(/\n{2,}/).map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 20)}`} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-slate-400">
            Sản phẩm chưa có mô tả.
          </p>
        )}
      </section>
    </article>
  );
}

function ProductPreviewGallery({
  images,
  index,
  onIndexChange,
  compact,
}: {
  images: ProductPreviewViewModel["generalImages"];
  index: number;
  onIndexChange: (index: number) => void;
  compact: boolean;
}) {
  const current = images[index] || images[0];
  if (!current)
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-slate-100 text-center text-slate-400">
        <ImageOff className="size-10" />
        <p className="mt-2 text-sm font-semibold">Sản phẩm chưa có hình ảnh</p>
      </div>
    );

  const move = (direction: -1 | 1) =>
    onIndexChange((index + direction + images.length) % images.length);
  return (
    <section className="min-w-0" aria-label="Thư viện ảnh sản phẩm">
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={current.url}
          alt={current.alt}
          className="size-full object-cover"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={() => move(-1)}
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Ảnh tiếp theo"
              onClick={() => move(1)}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div
          className={cn(
            "mt-3 flex max-w-full gap-2 overflow-x-auto pb-1",
            compact && "snap-x",
          )}
        >
          {images.map((image, imageIndex) => (
            <button
              key={image.clientId}
              type="button"
              aria-label={`Chọn ảnh ${imageIndex + 1}`}
              aria-pressed={imageIndex === index}
              onClick={() => onIndexChange(imageIndex)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100",
                imageIndex === index
                  ? "border-[#D96C8A]"
                  : "border-transparent",
              )}
            >
              <img src={image.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
