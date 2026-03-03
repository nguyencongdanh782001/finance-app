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
      <DialogContent className="flex flex-col items-center gap-4! h-fit max-w-89 bg-white rounded-[10px] px-6! py-7.5! overflow-y-auto">
        <DialogHeader className="flex flex-col justify-center items-center gap-4!">
          <DialogTitle className="uppercase text-13px text-gray-3 font-bold text-center">
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
