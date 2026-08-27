"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { useSearchParams } from "next/navigation";

interface BlockTotalExpenseProps {
  isLoading: boolean;
  totalExpense?: number;
}

const BlockTotalExpense = (props: BlockTotalExpenseProps) => {
  const { isLoading, totalExpense } = props;
  const now = new Date();
  const searchParams = useSearchParams();

  const urlMonth = Number(searchParams.get("month"));
  const defaultMonth = urlMonth || now.getMonth() + 1;

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-sm font-medium text-orange-3">
        chi tiêu tháng {defaultMonth}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-full rounded-1 mb-2" />
      ) : (
        <p className="truncate text-lg font-bold text-orange-3">
          {formatCurrencyVND(totalExpense || 0)}
        </p>
      )}
    </div>
  );
};

export default BlockTotalExpense;
