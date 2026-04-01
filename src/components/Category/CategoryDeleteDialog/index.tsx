"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryItemData } from "@/interface/category";
import { Loader2 } from "lucide-react";

interface CategoryDeleteDialogProps {
  open: boolean;
  category?: CategoryItemData | null;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CategoryDeleteDialog({
  open,
  category,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: CategoryDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-102.5 overflow-hidden rounded-[32px] border-none bg-transparent p-0 shadow-none">
        <div className="rounded-[32px] bg-white px-6 py-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
          <DialogTitle className="text-13px font-extrabold uppercase text-gray-3">
            Xác nhận xóa
          </DialogTitle>
          <DialogDescription className="mx-auto mt-4 text-sm leading-7 text-slate-400">
            Bạn có chắc chắn muốn xóa danh mục
            {category ? ` "${category.name}"` : ""}? Thao tác này không thể hoàn
            tác.
          </DialogDescription>

          <div className="mt-8 space-y-3">
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="h-14 w-full rounded-3xl bg-red-6 text-sm font-semibold text-red-4 hover:bg-red-5"
            >
              {isDeleting && (
                <Loader2 className="mr-1.25 h-3.5 w-3.5 animate-spin text-red-4" />
              )}
              Xóa
            </Button>
            <DialogClose
              asChild
              className="flex justify-items-center items-center w-full"
            >
              <Button variant="close" type="button">
                Đóng
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
