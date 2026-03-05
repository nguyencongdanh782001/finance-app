"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
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
    <div className="flex flex-col gap-1 rounded-[40px] px-5 py-6 border border-white shadow-sm bg-linear-to-tr from-orange-2 to-orange-5">
      <p className="text-green-1 text-13px font-bold uppercase">
        chi tiêu tháng {defaultMonth}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-full rounded-1 mb-2 bg-gray-300" />
      ) : (
        <p className="text-orange-3 text-base font-extrabold uppercase">
          {formatCompactNumber(totalExpense || 0)} VND
        </p>
      )}
    </div>
  );
};

export default BlockTotalExpense;
