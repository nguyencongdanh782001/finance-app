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
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";

import { Expense } from "@/interface/financeAPI";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

interface ModalDeleteExpenseProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  data: Expense;
}

const ModalDeleteExpense = (props: ModalDeleteExpenseProps) => {
  const { open, onClose, reload, data } = props;

  const params = useParams();

  const id = Number(params.id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const res = await financeAPI.deleteExpense(id, data.id);

    if (res.code === RESPONSE_CODES.success) {
      await onClose();
      reload();
    } else {
      toast({
        title: "Xoá chi phí thất bại",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center gap-4! h-fit max-w-89 bg-white rounded-[10px] px-6! py-7.5! overflow-y-auto">
        <DialogHeader className="flex flex-col justify-center items-center gap-4!">
          <DialogTitle className="uppercase text-13px text-gray-3 font-bold text-center mb-0!">
            Xoá chi phí
          </DialogTitle>
          <DialogDescription className="mt-0! text-center text-gray-2 text-base! font-normal">
            Bạn có chắc muốn xoá chi phí này không?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full flex flex-col justify-center items-center gap-4! mt-2">
          <Button
            type="button"
            disabled={isSubmitting}
            className="shadow-sm! h-14! w-full! flex items-center gap-2 rounded-xl bg-red-1 text-base text-white font-bold"
            onClick={handleSubmit}
          >
            {isSubmitting && (
              <Loader2 className="animate-spin w-3.5 h-3.5 text-white" />
            )}
            Xác nhận
          </Button>
          <Button variant="close" type="button" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDeleteExpense;
