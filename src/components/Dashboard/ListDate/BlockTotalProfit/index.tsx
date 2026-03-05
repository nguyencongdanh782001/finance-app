"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { useSearchParams } from "next/navigation";

interface BlockTotalProfitProps {
  isLoading: boolean;
  profit?: number;
}

const BlockTotalProfit = (props: BlockTotalProfitProps) => {
  const { isLoading, profit } = props;

  return (
    <div
      className={`flex flex-col gap-1 rounded-[40px] p-6 border border-white shadow-md bg-linear-to-tr ${profit && profit < 0 ? "from-red-6 to-red-5" : "from-green-18 to-green-17"}`}
    >
      <p className="text-green-1 text-13px font-bold uppercase">
        Lợi nhuận còn lại
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-full rounded-1 mb-2 bg-gray-300" />
      ) : (
        <p
          className={`text-base font-extrabold uppercase ${profit && profit < 0 ? "text-red-3" : "text-green-15 "}`}
        >
          {formatCompactNumber(profit || 0)} VND
        </p>
      )}
    </div>
  );
};

export default BlockTotalProfit;
