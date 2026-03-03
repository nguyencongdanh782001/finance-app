"use client";

import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { DailyDetailResponse } from "@/interface/financeAPI";
import { Banknote, Landmark } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface BlockBankProfitProps {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
}

const BlockBankProfit = (props: BlockBankProfitProps) => {
  const { data, isLoading } = props;
  return (
    <div className="flex flex-col p-6 rounded-4xl shadow-[0_10px_30px_-10px_rgba(14,165,233,0.45)] bg-white">
      <div className="flex items-center gap-3 mb-3">
        <Landmark className="size-5 text-blue-5" />
        <p className="text-green-1 text-13px font-bold uppercase">Ngân hàng</p>
      </div>

      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-green-1 text-11px">Doanh thu:</p>
        {isLoading ? (
          <Skeleton className="h-4 w-8 rounded-1 mb-2 bg-gray-300" />
        ) : (
          <p className="text-gray-3 text-11px font-bold">
            {formatCompactNumber(data?.revenueBank || 0)}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-green-1 text-11px">Vốn:</p>
        {isLoading ? (
          <Skeleton className="h-4 w-8 rounded-1 mb-2 bg-gray-300" />
        ) : (
          <p className="text-gray-3 text-11px font-bold">
            {formatCompactNumber(data?.capitalBank || 0)}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t-2 border-gray-6">
        <p className="text-green-1 text-13px font-bold uppercase">Lợi nhuận</p>
        {isLoading ? (
          <Skeleton className="h-7 w-full rounded-1 mb-2 bg-gray-300" />
        ) : (
          <p className="text-blue-6 text-base font-extrabold">
            {formatCompactNumber(data?.profitBank || 0)} VND
          </p>
        )}
      </div>
    </div>
  );
};

export default BlockBankProfit;
