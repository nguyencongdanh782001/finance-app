"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProductItemData } from "@/interface/product";

interface ProductDeleteDialogProps {
  open: boolean;
  product?: ProductItemData | null;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ProductDeleteDialog({
  open,
  product,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: ProductDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-102.5 overflow-hidden rounded-[32px] border-none bg-transparent p-0 shadow-none">
        <div className="rounded-[32px] bg-white px-6 py-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
          <DialogTitle className="text-13px font-extrabold uppercase text-gray-3">
            Xác nhận xóa
          </DialogTitle>
          <DialogDescription className="mx-auto mt-4 max-w-62.5 text-sm leading-7 text-slate-400">
            Bạn có chắc chắn muốn xóa sản phẩm
            {product ? ` "${product.title}"` : ""}? Ảnh sản phẩm cũng sẽ bị xóa.
          </DialogDescription>

          <div className="mt-8 space-y-3">
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="h-14 w-full rounded-2xl bg-red-6 text-base font-semibold text-red-4 hover:bg-red-5"
            >
              {isDeleting && (
                <Loader2 className="mr-[5px] h-[14px] w-[14px] animate-spin text-red-4" />
              )}
              Xóa
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                disabled={isDeleting}
                className="h-14 w-full rounded-2xl bg-slate-100 text-base font-semibold text-slate-500 hover:bg-slate-200"
              >
                Hủy
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
