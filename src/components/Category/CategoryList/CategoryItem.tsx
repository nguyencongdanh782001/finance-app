"use client";

import { Button } from "@/components/ui/button";
import {
  getCategoryColor,
  getCategoryIcon,
} from "@/components/Category/constants";
import { CategoryItemData } from "@/interface/category";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryItemProps {
  category: CategoryItemData;
  onEdit: (category: CategoryItemData) => void;
  onDelete: (category: CategoryItemData) => void;
}

const tryOnLabels = {
  UPPER_BODY: "Áo",
  LOWER_BODY: "Quần · chân váy",
  DRESSES: "Đầm · váy liền",
  SHOES: "Dép · giày",
  ACCESSORIES: "Nón · phụ kiện",
  NOT_SUPPORTED: "Không hỗ trợ AI",
} as const;

export default function CategoryItem({
  category,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const Icon = getCategoryIcon(category.icon);
  const color = getCategoryColor(category.color);

  return (
    <div className="admin-surface group rounded-2xl p-4 transition-colors duration-150 hover:border-(--admin-primary-border)">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/products?categoryId=${category.id}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${category.color}26` }}
          >
            <Icon className="size-5" style={{ color: color.value }} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-(--admin-text)">
              {category.name}
            </p>
            <p className="mt-0.5 text-sm font-medium text-(--admin-text-secondary)">
              {category.productCount.toLocaleString("vi-VN")} sản phẩm
            </p>
            <span className="mt-1 inline-flex rounded-full bg-(--admin-primary-soft) px-2 py-0.5 text-[10px] font-bold text-(--admin-primary)">
              {tryOnLabels[category.tryOnCategory || "NOT_SUPPORTED"]}
            </span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label={`Mở thao tác cho ${category.name}`}
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => onEdit(category)}
              className="text-blue-500 focus:bg-blue-50 focus:text-blue-600"
            >
              <Pencil className="size-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-rose-500 focus:bg-rose-50 focus:text-rose-500"
            >
              <Trash2 className="size-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
