"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormEditExpense from "./FormEditExpense";
import { Expense } from "@/interface/financeAPI";

interface ModalEditExpenseProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  data: Expense;
}

const ModalEditExpense = (props: ModalEditExpenseProps) => {
  const { open, onClose, reload, data } = props;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-fit max-w-[calc(100vw-24px)] flex-col gap-4! overflow-y-auto rounded-xl border-slate-200 bg-white px-6! py-6! shadow-xl sm:max-w-md">
        <DialogHeader className="flex flex-col justify-center items-center gap-4!">
          <DialogTitle className="text-center text-base font-semibold text-slate-900">
            Chỉnh sửa chi phí
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <FormEditExpense reload={reload} data={data} onClose={onClose} />
        <DialogFooter className="w-full flex flex-col justify-center items-center">
          <Button variant="close" type="button" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEditExpense;
