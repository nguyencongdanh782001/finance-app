"use client";
import { Container } from "@/components/ui/container";
import BlockIcon from "@/components/icon/element/BlockIcon";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { useEffect, useState } from "react";
import { YearProfitResponse } from "@/interface/financeAPI";
import { financeAPI } from "@/endpoint/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import { Skeleton } from "@/components/ui/skeleton";
import ListDate from "@/components/Dashboard/ListDate";
import ChartYearlyRevenue from "@/components/Dashboard/ChartYearlyRevenue";
import { usePathname, useSearchParams } from "next/navigation";

export default function HomeContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [yearProfit, setYearProfit] = useState<YearProfitResponse | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await financeAPI.getYearProfit();
      if (res.code === RESPONSE_CODES.success) {
        setYearProfit(res.data);
      }
      setIsLoading(false);
    };
    fetchData();
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, searchParams.toString()]);

  return (
    <Container className="gap-8 pb-8">
      <div className="mt-8 flex items-center gap-4">
        <BlockIcon className="text-green-2" />
        <div>
          <p className="text-blue-2 text-md font-extrabold">Trang Chủ</p>
          <p className="uppercase text-10px text-green-1 font-bold">
            Tổng quan tài chính của vợ yêu
          </p>
        </div>
      </div>
      {/* Total revenue of year */}
      <div className="p-8 rounded-[40px] bg-white shadow-[0_8px_10px_-6px_rgba(134,188,176,0.05),0_10px_25px_-5px_rgba(134,188,176,0.1)]">
        {isLoading ? (
          <Skeleton className="h-6 w-50 rounded-2 mb-2" />
        ) : (
          <p className="text-11px text-green-1 font-bold">
            Tổng lợi nhuận năm {yearProfit?.year}
          </p>
        )}

        {isLoading ? (
          <Skeleton className="h-6 w-50 rounded-2" />
        ) : (
          <p className="text-3xl text-blue-2 font-extrabold">
            {formatCurrencyVND(yearProfit?.totalProfit || 0)}{" "}
            <span className="uppercase text-md text-green-1">vnđ</span>
          </p>
        )}
      </div>
      {/* List revenue follow month */}
      <ListDate />

      {/* Chart Yearly Revenue */}
      <ChartYearlyRevenue />
    </Container>
  );
}
