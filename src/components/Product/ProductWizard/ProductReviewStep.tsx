"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import ProductPreview from "@/components/Product/ProductPreview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductPreviewViewModel } from "@/lib/products/product-preview";
import type { ProductValidationError } from "@/lib/products/product-draft-validation";

type Props = {
  product: ProductPreviewViewModel;
  errors: ProductValidationError[];
  onErrorClick: (error: ProductValidationError) => void;
};

const statusBanner = {
  PUBLIC: {
    title: "Sản phẩm công khai",
    description: "Sản phẩm sẽ được hiển thị công khai sau khi hoàn tất.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  PRIVATE: {
    title: "Sản phẩm riêng tư",
    description:
      "Sản phẩm ở chế độ riêng tư và sẽ không xuất hiện ngoài cửa hàng.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  DISCONTINUED: {
    title: "Sản phẩm ngừng bán",
    description: "Sản phẩm đang ở trạng thái ngừng bán.",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
} as const;

export default function ProductReviewStep({
  product,
  errors,
  onErrorClick,
}: Props) {
  const [layout, setLayout] = useState<"desktop" | "mobile">("desktop");
  const banner = statusBanner[product.status];
  const variantErrors = errors.filter((error) => error.step === "variants");
  const readiness = [
    {
      label: "Thông tin sản phẩm",
      valid: !errors.some((error) => error.step === "info"),
      detail: product.title,
    },
    {
      label: "Danh mục",
      valid: !errors.some((error) => error.step === "category"),
      detail: product.categoryPath.join(" / ") || "Chưa chọn danh mục",
    },
    {
      label: "Hình ảnh",
      valid: !errors.some((error) => error.step === "images"),
      detail: product.generalImages.length
        ? `${product.generalImages.length} ảnh chung`
        : "Không bắt buộc",
    },
    {
      label: "Biến thể",
      valid: !variantErrors.some(
        (error) =>
          !error.path.endsWith(".sku") && !error.path.endsWith(".stock"),
      ),
      detail: product.hasVariants
        ? `${product.colors.reduce((total, color) => total + color.variants.length, 0)} biến thể hợp lệ`
        : "Dùng giá và kho mặc định",
    },
    {
      label: "SKU",
      valid: !variantErrors.some((error) => error.path.endsWith(".sku")),
      detail: "Không thiếu hoặc trùng trong bản nháp",
    },
    {
      label: "Tồn kho",
      valid: !variantErrors.some((error) => error.path.endsWith(".stock")),
      detail: "Số nguyên không âm cho từng biến thể",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--admin-primary)">
            Bước 5/5
          </p>
          <h2 className="mt-1 text-xl font-bold text-(--admin-text)">
            Kiểm tra và hoàn tất
          </h2>
          <p className="mt-1 text-sm text-(--admin-text-secondary)">
            Trải nghiệm sản phẩm như khách hàng trước khi áp dụng.
          </p>
        </div>
        <div
          className="inline-flex w-fit rounded-xl border border-(--admin-border) bg-white p-1"
          aria-label="Chế độ xem trước"
        >
          <Button
            type="button"
            size="sm"
            variant={layout === "desktop" ? "adminPrimary" : "ghost"}
            aria-pressed={layout === "desktop"}
            onClick={() => setLayout("desktop")}
          >
            <Monitor className="size-4" /> Desktop
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layout === "mobile" ? "adminPrimary" : "ghost"}
            aria-pressed={layout === "mobile"}
            onClick={() => setLayout("mobile")}
          >
            <Smartphone className="size-4" /> Mobile
          </Button>
        </div>
      </div>

      <div className={cn("rounded-xl border p-3", banner.className)}>
        <p className="font-bold">{banner.title}</p>
        <p className="mt-0.5 text-sm opacity-90">{banner.description}</p>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-2xl bg-(--admin-surface-subtle) p-2 sm:p-4",
          layout === "mobile" && "py-5",
        )}
      >
        <ProductPreview product={product} mode="admin-preview" layout={layout} />
      </div>

      <section className="rounded-2xl border border-(--admin-border) bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-(--admin-primary)" />
            <h3 className="font-bold text-(--admin-text)">Sẵn sàng hoàn tất</h3>
          </div>
          {errors.length ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
              Còn {errors.length} mục cần chỉnh sửa
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Đã sẵn sàng
            </span>
          )}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {readiness.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-start gap-2 rounded-xl bg-(--admin-surface-subtle) p-3"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  item.valid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600",
                )}
              >
                {item.valid ? (
                  <Check className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-(--admin-text)">
                  {item.label}
                </span>
                <span className="block truncate text-xs text-(--admin-text-secondary)">
                  {item.detail}
                </span>
              </span>
            </div>
          ))}
        </div>
        {errors.length ? (
          <div className="mt-3 space-y-2 border-t border-(--admin-border) pt-3">
            {errors.slice(0, 4).map((error) => (
              <button
                key={`${error.step}-${error.path}-${error.message}`}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => onErrorClick(error)}
              >
                <span>{error.message}</span>
                <span className="shrink-0 text-xs font-semibold underline">
                  Chỉnh sửa
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
