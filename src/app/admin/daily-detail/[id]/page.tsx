"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import BlockBankProfit from "@/components/DailyDetail/BlockCashBank";
import BlockCashProfit from "@/components/DailyDetail/BlockCashProfit";
import FormCapital from "@/components/DailyDetail/FormCapital";
import DailyOrderSection from "@/components/DailyDetail/DailyOrderSection";
import FormNote from "@/components/DailyDetail/FormNote";
import FormProducts from "@/components/DailyDetail/FormProducts";
import FormRevenue from "@/components/DailyDetail/FormRevenue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { TZ_TEMPLATE } from "@/constant/date";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { formatTZ } from "@/helper/date";
import { DailyDetailResponse } from "@/interface/financeAPI";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const DailyDetail = () => {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [dailyDetailData, setDailyDetailData] = useState<
    DailyDetailResponse | undefined
  >(undefined);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"revenue" | "orders" | "products">(
    "revenue",
  );

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

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
    window.scrollTo({ top: 0, left: 0 });
    void fetchData();
  }, [id]);

  useEffect(() => {
    if (reload) {
      void fetchData(false);
    }
  }, [reload, id]);

  const canNavigatePrevious = Boolean(dailyDetailData?.previousDay);
  // const canNavigateNext = Boolean(
  //   dailyDetailData?.nextDay &&
  //   !dayjs(dailyDetailData.nextDay.date).isAfter(dayjs(), "day"),
  // );

  const handleNavigateDay = (targetId?: number, targetDate?: string) => {
    if (
      !targetId ||
      isLoading ||
      targetId === id
      // || (targetDate && dayjs(targetDate).isAfter(dayjs(), "day"))
    ) {
      return;
    }

    setIsLoading(true);
    router.push(`/admin/daily-detail/${targetId}`);
  };

  return (
    <AdminPageContainer>
      <Toaster />
      <AdminPageHeader
        title="Chi tiết ngày"
        description="Cập nhật doanh thu, đơn hàng và sản phẩm bán trong ngày."
        breadcrumb={
          <span className="flex items-center gap-1.5">
            <Link href="/admin" className="text-primary hover:underline">
              Tổng quan
            </Link>
            <span aria-hidden="true">/</span>
            <span>Chi tiết ngày</span>
          </span>
        }
      />
      <div className="grid w-full min-w-0 grid-cols-3 rounded-lg border border-slate-200 bg-white p-1 sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("revenue")}
          className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors sm:min-w-30 ${
            activeTab === "revenue"
              ? "bg-primary text-white"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <TrendingUp
            className={`size-3.5 ${
              activeTab === "revenue" ? "text-white" : "text-slate-400"
            }`}
          />
          Doanh thu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors sm:min-w-30 ${
            activeTab === "orders"
              ? "bg-primary text-white"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <ReceiptText
            className={`size-3.5 ${
              activeTab === "orders" ? "text-white" : "text-slate-400"
            }`}
          />
          Đơn hàng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors sm:min-w-30 ${
            activeTab === "products"
              ? "bg-primary text-white"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <PackageCheck
            className={`size-3.5 ${
              activeTab === "products" ? "text-white" : "text-slate-400"
            }`}
          />
          Sản phẩm
        </button>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        {isLoading ? (
          <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2.5">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-3 w-24 rounded-2" />
              <Skeleton className="h-8 w-56 rounded-2" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                handleNavigateDay(
                  dailyDetailData?.previousDay?.id,
                  dailyDetailData?.previousDay?.date,
                )
              }
              disabled={!canNavigatePrevious}
              className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              aria-label="Chuyển về ngày trước"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="min-w-0 text-center">
              <p className="text-xs font-medium text-slate-400">
                Ngày hiện tại
              </p>
              <h2 className="mt-1 text-xl font-bold capitalize text-slate-900">
                {formatTZ(
                  dailyDetailData?.date || "",
                  TZ_TEMPLATE.date_day_month,
                )}
              </h2>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                handleNavigateDay(
                  dailyDetailData?.nextDay?.id,
                  dailyDetailData?.nextDay?.date,
                )
              }
              // disabled={!canNavigateNext}
              className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              aria-label="Chuyển tới ngày kế tiếp"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BlockCashProfit data={dailyDetailData} isLoading={isLoading} />
              <BlockBankProfit data={dailyDetailData} isLoading={isLoading} />
            </div>

            <div className="sticky bottom-3 z-20 mt-auto flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Tổng doanh thu ngày
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-60 rounded-2 mt-1" />
                ) : (
                  <p
                    className={`text-xl font-bold ${dailyDetailData?.totalProfit && dailyDetailData?.totalProfit < 0 ? "text-red-600" : "text-primary"}`}
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
                  className={`rounded-lg p-3 ${dailyDetailData?.totalProfit < 0 ? "bg-red-50" : "bg-primary/10"}`}
                >
                  {dailyDetailData?.totalProfit < 0 ? (
                    <TrendingDown className={`size-5 text-red-1`} />
                  ) : (
                    <TrendingUp className="size-5 text-primary" />
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
          </>
        ) : activeTab === "orders" ? (
          <DailyOrderSection
            data={dailyDetailData}
            isLoading={isLoading}
            reload={reload}
            onReload={() => setReload(true)}
          />
        ) : (
          <FormProducts
            data={dailyDetailData}
            isLoading={isLoading}
            reload={reload}
            onReload={() => setReload(true)}
          />
        )}
      </div>
    </AdminPageContainer>
  );
};

export default DailyDetail;
