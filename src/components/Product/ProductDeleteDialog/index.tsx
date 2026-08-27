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
      <DialogContent className="w-[calc(100%-24px)] max-w-md rounded-xl border border-slate-200 bg-white px-6 py-7 text-center shadow-xl">
        <div>
          <DialogTitle className="text-13px font-extrabold uppercase text-gray-3">
            Xác nhận xóa
          </DialogTitle>
          <DialogDescription className="mx-auto mt-4 max-w-64 text-sm leading-7 text-slate-400">
            Bạn có chắc chắn muốn xóa sản phẩm
            {product ? ` "${product.title}"` : ""}?
          </DialogDescription>

          <div className="mt-8 space-y-3">
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              variant="adminDanger"
              className="h-10 w-full rounded-lg"
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
