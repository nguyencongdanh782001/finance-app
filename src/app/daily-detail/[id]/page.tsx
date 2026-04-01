"use client";

import Header from "@/components/common/Header";
import BlockBankProfit from "@/components/DailyDetail/BlockCashBank";
import BlockCashProfit from "@/components/DailyDetail/BlockCashProfit";
import FormCapital from "@/components/DailyDetail/FormCapital";
import FormNote from "@/components/DailyDetail/FormNote";
import FormProducts from "@/components/DailyDetail/FormProducts";
import FormRevenue from "@/components/DailyDetail/FormRevenue";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { TZ_TEMPLATE } from "@/constant/date";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { formatTZ } from "@/helper/date";
import { DailyDetailResponse } from "@/interface/financeAPI";
import { PackageCheck, TrendingDown, TrendingUp } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"revenue" | "products">("revenue");

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
    <div className="sm:max-w-191.25 mx-auto relative">
      <Toaster />
      <Header>
        <div className="sm:max-w-[765px] mx-auto">
          <div className="grid w-full grid-cols-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("revenue")}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-all ${
                activeTab === "revenue"
                  ? "bg-white text-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <TrendingUp
                className={`size-3.5 ${
                  activeTab === "revenue" ? "text-green-13" : "text-slate-400"
                }`}
              />
              Doanh thu
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-all ${
                activeTab === "products"
                  ? "bg-white text-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <PackageCheck
                className={`size-3.5 ${
                  activeTab === "products" ? "text-green-13" : "text-slate-400"
                }`}
              />
              Sản phẩm
            </button>
          </div>
        </div>
      </Header>
      <Container className="gap-8 py-6 min-h-[calc(100svh-117px)]!">
        {isLoading ? (
          <Skeleton className="mb-2 h-7 w-60 rounded-2" />
        ) : (
          <h3 className="text-blue-2 text-3xl font-extrabold capitalize">
            {formatTZ(dailyDetailData?.date || "", TZ_TEMPLATE.date_day_month)}
          </h3>
        )}

        {activeTab === "revenue" ? (
          <>
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

            <FormNote
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
                  <Skeleton className="h-8 w-60 rounded-2 mt-1" />
                ) : (
                  <p
                    className={`text-xl ${dailyDetailData?.totalProfit && dailyDetailData?.totalProfit < 0 ? "text-red-1" : "text-green-13"} font-extrabold`}
                  >
                    {dailyDetailData?.totalProfit &&
                    dailyDetailData?.totalProfit > 0
                      ? "+"
                      : ""}
                    {formatCurrencyVND(dailyDetailData?.totalProfit || 0)}
                  </p>
                )}
              </div>
              {dailyDetailData?.totalProfit ? (
                <div
                  className={`p-5.5 rounded-3xl  ${dailyDetailData?.totalProfit < 0 ? "bg-red-100" : "bg-green-14"}`}
                >
                  {dailyDetailData?.totalProfit < 0 ? (
                    <TrendingDown className={`size-5 text-red-1`} />
                  ) : (
                    <TrendingUp className={`size-5 text-green-13`} />
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
          </>
        ) : (
          <FormProducts
            data={dailyDetailData}
            isLoading={isLoading}
            reload={reload}
            onReload={() => setReload(true)}
          />
        )}
      </Container>
    </div>
  );
};

export default DailyDetail;
