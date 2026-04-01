"use client";

import { Button } from "@/components/ui/button";
import {
  getCategoryColor,
  getCategoryIcon,
} from "@/components/Category/constants";
import { CategoryItemData } from "@/interface/category";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
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

export default function CategoryItem({
  category,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const Icon = getCategoryIcon(category.icon);
  const color = getCategoryColor(category.color);

  return (
    <div className="group rounded-4xl border border-[#edf2f7] bg-white p-4 shadow-[0_12px_30px_rgba(148,163,184,0.08)]">
      <div className="flex items-center gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          style={{ backgroundColor: `${category.color}26` }}
        >
          <Icon className="size-5" style={{ color: color.value }} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-gray-7">
            {category.name}
          </p>
          <p className="mt-px text-sm font-medium text-green-1">
            {category.productCount.toLocaleString("vi-VN")} sản phẩm
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
