"use client";

import Header from "@/components/common/Header";
import FormAddExpense from "@/components/MonthlyDetail/FormAddExpense";
import ListExpense from "@/components/MonthlyDetail/ListExpense";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { MonthlyDetailResponse } from "@/interface/financeAPI";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const MonthDetail = () => {
  const params = useParams();

  const id = Number(params.id);

  const [monthlyDetailData, setMonthlyDetailData] = useState<
    MonthlyDetailResponse | undefined
  >(undefined);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const fetchData = async () => {
    try {
      if (!reload) setIsLoading(true);
      const res = await financeAPI.getMonthlyDetailData(id);
      if (res.code === RESPONSE_CODES.success) {
        setMonthlyDetailData(res.data);
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

  const revenue = monthlyDetailData?.totalRevenue ?? 0;
  const expense = monthlyDetailData?.totalExpense ?? 0;

  const expensePercent =
    revenue === 0 ? null : Number(((expense / revenue) * 100).toFixed(1));

  return (
    <div className="sm:max-w-191.25 mx-auto">
      <Toaster />
      <Header />
      <Container className="gap-8 py-8 min-h-[calc(100svh-117px)]!">
        {isLoading ? (
          <Skeleton className="h-7 w-60 rounded-2 mb-2 bg-gray-300" />
        ) : (
          <h3 className="text-blue-2 text-3xl font-extrabold">
            Tháng {monthlyDetailData?.month}, {monthlyDetailData?.year}
          </h3>
        )}

        <div className="rounded-[40px] bg-green-50 p-8 border border-gray-200 shadow-sm">
          <p className="text-13px text-green-9 uppercase font-bold">
            Tổng doanh thu
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-60 rounded-2 mb-2 bg-gray-300" />
          ) : (
            <p className="text-[28px] text-blue-2 font-extrabold">
              {formatCompactNumber(monthlyDetailData?.totalRevenue || 0)} VND
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-md text-blue-2 uppercase font-bold">
            Thêm chi phí
          </p>
          <FormAddExpense reload={() => setReload(true)} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center gap-10">
            <p className="text-md text-blue-2 uppercase font-bold">
              Chi phí trong tháng
            </p>

            {isLoading ? (
              <Skeleton className="h-6 w-30 rounded-2 bg-gray-300" />
            ) : (
              <p className="text-green-1 text-xs font-bold uppercase">
                {monthlyDetailData?.expenses.length} hạng mục
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col bg-white shadow-md p-5 rounded-[32px] gap-2">
              <Skeleton className="h-7 w-60 rounded-2 bg-gray-300" />
              <Skeleton className="h-6 w-60 rounded-2 bg-gray-300" />
              <Skeleton className="h-7 w-60 rounded-2 bg-gray-300" />
            </div>
          ) : (
            <ListExpense
              data={monthlyDetailData?.expenses}
              reload={() => setReload(true)}
            />
          )}
        </div>

        <div
          className="mt-auto sticky bottom-0 flex flex-col bg-white p-5 rounded-[32px] gap-5"
          style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.75">
              <p className="text-green-1 text-sm font-extrabold uppercase">
                Tổng chi phí
              </p>
              {isLoading ? (
                <Skeleton className="h-6 w-30 rounded-2 bg-gray-300" />
              ) : (
                <p className="text-gray-3 text-base font-bold uppercase">
                  {formatCompactNumber(monthlyDetailData?.totalExpense || 0)}{" "}
                  vnd
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-0.75">
              <p className="text-green-1 text-sm font-extrabold uppercase">
                Phần trăm chi tiêu
              </p>
              {isLoading ? (
                <Skeleton className="h-6 w-30 rounded-2 bg-gray-300" />
              ) : (
                <p className="text-orange-1 text-base font-bold text-right">
                  {!revenue && expense > 0 ? 100 : expensePercent || 0}%
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-6 py-4 border border-green-11 bg-green-12 rounded-[24px]">
            <div className="flex flex-col">
              <p className="text-green-9 text-sm font-bold">Lợi nhuận</p>
              <p className="text-green-10 text-sm font-medium">(còn lại)</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-30 rounded-2 bg-gray-300" />
            ) : (
              <p
                className={`${monthlyDetailData?.profit && monthlyDetailData?.profit < 0 ? "text-red-1" : "text-green-9"}  text-base font-extrabold`}
              >
                {formatCompactNumber(monthlyDetailData?.profit || 0)} VND
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MonthDetail;
