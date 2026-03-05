"use client";

import { Button } from "@/components/ui/button";
import { TZ_TEMPLATE } from "@/constant/date";
import { formatTZ } from "@/helper/date";
import { Expense } from "@/interface/financeAPI";
import { Edit, Trash2Icon } from "lucide-react";
import { useState } from "react";
import ModalEditExpense from "../ModalEditExpense";
import ModalDeleteExpense from "../ModalDeleteExpense";
import { formatCurrencyVND } from "@/helper/convertCurrency";

interface ExpenseItemProps {
  data: Expense;
  reload: () => void;
}
const ExpenseItem = (props: ExpenseItemProps) => {
  const { data, reload } = props;
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="flex flex-col bg-white shadow-md p-5 rounded-[32px]">
      <div className="flex items-start justify-between gap-6">
        <p className="text-base text-gray-7 font-bold">{data?.name}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-2! h-fit! bg-gray-6! rounded-full shadow-sm"
            onClick={() => setOpenEdit(true)}
          >
            <Edit className="size-4 text-green-1" />
          </Button>

          <Button
            variant="ghost"
            className="p-2! h-fit! bg-gray-6! rounded-full shadow-sm"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2Icon className="size-4 text-green-1" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-green-1 font-medium">
        {formatTZ(data?.createdAt || "", TZ_TEMPLATE.year_month_day)}
      </p>
      <p className="mt-2 text-base text-gray-2 font-bold">
        {formatCurrencyVND(Number(data?.amount || 0))} VND
      </p>

      <ModalEditExpense
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        reload={reload}
        data={data}
      />
      <ModalDeleteExpense
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        reload={reload}
        data={data}
      />
    </div>
  );
};

export default ExpenseItem;
