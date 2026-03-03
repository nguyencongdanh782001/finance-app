"use client";

import Header from "@/components/common/Header";
import BlockBankProfit from "@/components/DailyDetail/BlockCashBank";
import BlockCashProfit from "@/components/DailyDetail/BlockCashProfit";
import FormCapital from "@/components/DailyDetail/FormCapital";
import FormRevenue from "@/components/DailyDetail/FormRevenue";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { TZ_TEMPLATE } from "@/constant/date";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatTZ } from "@/helper/date";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { toast } from "@/hook/use-toast";
import {
  DailyDetailResponse,
  UpdateDailyRequest,
} from "@/interface/financeAPI";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const DailyDetail = () => {
  const params = useParams();

  const id = Number(params.id);

  const [dailyDetailData, setDailyDetailData] = useState<
    DailyDetailResponse | undefined
  >(undefined);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const fetchData = async () => {
    try {
      if (!reload) setIsLoading(true);
      const res = await financeAPI.getDailyDetailData(id);
      if (res.code === RESPONSE_CODES.success) {
        setDailyDetailData(res.data);
      }
    } finally {
      setIsLoading(false);
      setReload(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (reload) fetchData();
  }, [reload]);

  return (
    <div className="sm:max-w-191.25 mx-auto">
      <Toaster />
      <Header />
      <Container className="gap-8 py-8 min-h-[calc(100svh-117px)]!">
        {isLoading ? (
          <Skeleton className="h-7 w-60 rounded-2 mb-2 bg-gray-300" />
        ) : (
          <h3 className="text-blue-2 text-3xl font-extrabold capitalize">
            {formatTZ(dailyDetailData?.date || "", TZ_TEMPLATE.date_day_month)}
          </h3>
        )}

        <FormCapital
          data={dailyDetailData}
          isLoading={isLoading}
          reload={reload}
          onReload={() => setReload(true)}
        />

        <FormRevenue
          data={dailyDetailData}
          isLoading={isLoading}
          reload={reload}
          onReload={() => setReload(true)}
        />

        <div className="grid grid-cols-2 gap-4">
          <BlockCashProfit data={dailyDetailData} isLoading={isLoading} />
          <BlockBankProfit data={dailyDetailData} isLoading={isLoading} />
        </div>

        <div
          className="mt-auto sticky bottom-0 flex items-center justify-between bg-white p-6 rounded-4xl"
          style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}
        >
          <div>
            <p className="text-base text-green-1 font-bold uppercase">
              Tổng lợi nhuận ngày
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-60 rounded-2 mt-1 bg-gray-300" />
            ) : (
              <p
                className={`text-xl ${dailyDetailData?.totalProfit && dailyDetailData?.totalProfit < 0 ? "text-red-1" : "text-green-13"} font-extrabold`}
              >
                {dailyDetailData?.totalProfit &&
                dailyDetailData?.totalProfit > 0
                  ? "+"
                  : ""}
                {formatCompactNumber(dailyDetailData?.totalProfit || 0)} VND
              </p>
            )}
          </div>
          {dailyDetailData?.totalProfit && (
            <div
              className={`p-5.5 rounded-3xl  ${dailyDetailData?.totalProfit < 0 ? "bg-red-100" : "bg-green-14"}`}
            >
              {dailyDetailData?.totalProfit < 0 ? (
                <TrendingDown className={`size-5 text-red-1`} />
              ) : (
                <TrendingUp className={`size-5 text-green-13`} />
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default DailyDetail;
