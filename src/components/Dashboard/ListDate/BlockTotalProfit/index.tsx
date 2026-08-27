"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { useSearchParams } from "next/navigation";

interface BlockTotalProfitProps {
  isLoading: boolean;
  profit?: number;
}

const BlockTotalProfit = (props: BlockTotalProfitProps) => {
  const { isLoading, profit } = props;
  const now = new Date();
  const searchParams = useSearchParams();

  const urlMonth = Number(searchParams.get("month"));
  const defaultMonth = urlMonth || now.getMonth() + 1;

  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-xl border px-4 py-4 ${profit && profit < 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-sm font-medium text-emerald-700">
        Doanh thu tháng {defaultMonth}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-full rounded-1 mb-2" />
      ) : (
        <p
          className={`truncate text-lg font-bold ${profit && profit < 0 ? "text-red-700" : "text-emerald-700"}`}
        >
          {formatCurrencyVND(profit || 0)}
        </p>
      )}
    </div>
  );
};

export default BlockTotalProfit;
