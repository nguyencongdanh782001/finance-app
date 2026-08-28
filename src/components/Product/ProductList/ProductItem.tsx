"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductItemData, ProductStatus } from "@/interface/product";
import {
  AlertTriangle,
  Box,
  ChevronDown,
  EllipsisVertical,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}`;
}

const PRODUCT_STATUS_OPTIONS: Array<{
  value: ProductStatus;
  label: string;
  className: string;
  dotClassName: string;
}> = [
  {
    value: "PUBLIC",
    label: "Công khai",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    dotClassName: "bg-emerald-500",
  },
  {
    value: "PRIVATE",
    label: "Riêng tư",
    className: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
    dotClassName: "bg-pink-500",
  },
  {
    value: "DISCONTINUED",
    label: "Ngừng bán",
    className: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
    dotClassName: "bg-slate-400",
  },
];

interface ProductItemProps {
  product: ProductItemData;
  onEdit: (product: ProductItemData) => void;
  onDelete: (product: ProductItemData) => void;
  onStatusChange: (product: ProductItemData, status: ProductStatus) => void;
  isStatusUpdating: boolean;
}

export default function ProductItem({
  product,
  onEdit,
  onDelete,
  onStatusChange,
  isStatusUpdating,
}: ProductItemProps) {
  const [showImage, setShowImage] = useState(Boolean(product.imageUrl));
  const isOutOfStock = product.totalAvailableStock <= 0;
  const statusOption =
    PRODUCT_STATUS_OPTIONS.find(
      (option) => option.value === product.productStatus,
    ) || PRODUCT_STATUS_OPTIONS[0];

  useEffect(() => {
    setShowImage(Boolean(product.imageUrl));
  }, [product.imageUrl]);

  return (
    <div
      className={`admin-surface rounded-2xl p-4 transition-colors duration-150 hover:border-(--admin-primary-border) ${
        isOutOfStock ? "border-rose-200 bg-rose-50/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {showImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover"
                onError={() => setShowImage(false)}
              />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-50 text-slate-400">
              <Box className="size-6" />
              <span className="text-10px font-semibold">Chưa có ảnh</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-1 text-[15px] font-semibold text-(--admin-text)">
                {product.title}
              </p>
              <p className="mt-1 text-xs font-medium text-(--admin-text-muted)">
                {product.categoryName}
              </p>
              <div className="flex flex-col items-start sm:items-center gap-2 mt-2 sm:flex-row">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      disabled={isStatusUpdating}
                      className={`rounded-full border px-2.5 font-semibold ${statusOption.className}`}
                      aria-label={`Đổi trạng thái của ${product.title}`}
                    >
                      {isStatusUpdating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <span
                          className={`size-2 rounded-full ${statusOption.dotClassName}`}
                          aria-hidden="true"
                        />
                      )}
                      {isStatusUpdating ? "Đang cập nhật" : statusOption.label}
                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuRadioGroup
                      value={product.productStatus}
                      onValueChange={(value) =>
                        onStatusChange(product, value as ProductStatus)
                      }
                    >
                      {PRODUCT_STATUS_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer rounded-xl focus:bg-slate-50"
                        >
                          <span
                            className={`size-2 rounded-full ${option.dotClassName}`}
                            aria-hidden="true"
                          />
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {isOutOfStock ? (
                  <div className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-1 text-11px font-semibold text-rose-700">
                    <AlertTriangle className="size-3.5" />
                    Hết hàng
                  </div>
                ) : null}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={`Mở thao tác cho ${product.title}`}
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onEdit(product)}
                  className="text-(--admin-primary) focus:bg-(--admin-primary-soft) focus:text-(--admin-primary)"
                >
                  <Pencil className="size-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="text-rose-500 focus:bg-rose-50 focus:text-rose-500"
                >
                  <Trash2 className="size-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex items-start gap-6">
            <div>
              <p className="text-11px font-medium text-(--admin-text-muted)">
                Giá nhập
              </p>
              <p className="mt-1 text-13px font-semibold tabular-nums text-(--admin-text)">
                {formatCurrency(product.importPrice)}
              </p>
            </div>
            <div>
              <p className="text-11px font-medium text-(--admin-text-muted)">
                Giá bán
              </p>
              <p className="mt-1 text-13px font-semibold tabular-nums text-(--admin-text)">
                {formatCurrency(product.sellPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-10px font-medium text-(--admin-text-muted)">
            Số lượng trong kho
          </p>
          {isOutOfStock ? (
            <p className="mt-1 text-xs font-semibold text-rose-500">
              Sản phẩm hiện đã hết hàng
            </p>
          ) : null}
        </div>
        <p
          className={`mt-1 text-sm font-extrabold ${
            isOutOfStock ? "text-rose-600" : "text-(--admin-text-secondary)"
          }`}
        >
          {product.totalAvailableStock.toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
}
