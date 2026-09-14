"use client";

import * as React from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  tone = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border border-(--admin-border) bg-white p-0 shadow-2xl">
        <div className="p-5 sm:p-6">
          <DialogHeader className="space-y-3 text-left">
            <div
              className={`flex size-11 items-center justify-center rounded-full ${
                tone === "danger"
                  ? "bg-red-50 text-red-600"
                  : "bg-(--admin-primary-soft) text-(--admin-primary)"
              }`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-(--admin-text)">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-(--admin-text-secondary)">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="flex-row justify-end gap-2 border-t border-(--admin-border) bg-(--admin-surface-subtle) px-5 py-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={isConfirming}
              className="border border-(--admin-border) bg-white"
            >
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={tone === "danger" ? "adminDanger" : "adminPrimary"}
            disabled={isConfirming}
            onClick={async () => {
              setIsConfirming(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setIsConfirming(false);
              }
            }}
          >
            {isConfirming ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            {isConfirming ? "Đang xử lý..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
