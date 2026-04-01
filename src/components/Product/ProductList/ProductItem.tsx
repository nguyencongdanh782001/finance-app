"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductItemData } from "@/interface/product";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} vnđ`;
}

interface ProductItemProps {
  product: ProductItemData;
  onEdit: (product: ProductItemData) => void;
  onDelete: (product: ProductItemData) => void;
}

export default function ProductItem({
  product,
  onEdit,
  onDelete,
}: ProductItemProps) {
  return (
    <div className="rounded-[24px] bg-white px-4 py-4 shadow-[0_16px_40px_rgba(148,163,184,0.10)]">
      <div className="flex items-start gap-3">
        <div className="h-23 w-23 shrink-0 overflow-hidden rounded-[24px] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-1 text-[15px] font-extrabold text-slate-700">
                {product.title}
              </p>
              <p className="mt-1 text-10px font-bold uppercase tracking-[0.08em] text-slate-300">
                {product.categoryName}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onEdit(product)}
                  className="text-blue-500 focus:bg-blue-50 focus:text-blue-600"
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
              <p className="text-[9px] font-bold uppercase text-slate-300">
                Giá nhập
              </p>
              <p className="mt-1 text-13px font-extrabold text-slate-700">
                {formatCurrency(product.importPrice)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-300">
                Giá bán
              </p>
              <p className="mt-1 text-13px font-extrabold text-emerald-500">
                {formatCurrency(product.sellPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center">
        <p className="text-10px font-bold text-slate-300">Số lượng trong kho</p>
        <p className="mt-1 text-sm font-extrabold text-slate-600">
          {product.quantity.toLocaleString("vi-VN")}
        </p>
      </div>
    </div>
  );
}
