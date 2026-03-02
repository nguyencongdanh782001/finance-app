"use client";

import AddCostForm from "@/components/MonthlyDetail/FormCost";
import ListExpense from "@/components/MonthlyDetail/ListExpense";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { MonthlyDetailResponse } from "@/interface/financeAPI";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MonthDetail = () => {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);

  const [monthlyDetailData, setMonthlyDetailData] = useState<
    MonthlyDetailResponse | undefined
  >(undefined);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!reload) setIsLoading(true);
      const res = await financeAPI.getMonthlyDetailData(id);
      if (res.code === RESPONSE_CODES.success) {
        setMonthlyDetailData(res.data);
      }
      setIsLoading(false);
      setReload(false);
    };
    fetchData();
  }, [id, reload]);

  return (
    <div className="sm:max-w-191.25 mx-auto">
      <Toaster />
      <div className="pb-6.25 border-b border-blue-1 pt-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-0! gap-1 h-fit! font-medium text-base text-green-9 ml-5"
        >
          <ChevronLeft className="size-5" />
          Quay lại
        </Button>
        <h3 className="uppercase font-extrabold text-blue-2 text-base text-center mt-4">
          Báo cáo tài chính
        </h3>
      </div>
      <Container className="gap-8 py-8">
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
              {formatCompactNumber(monthlyDetailData?.profit || 0)} VND
            </p>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-md text-blue-2 uppercase font-bold">
            Thêm chi phí
          </p>
          <AddCostForm reload={() => setReload(true)} />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center gap-10">
            <p className="text-md text-blue-2 uppercase font-bold">
              Chi phí trong tháng
            </p>

            <p className="text-green-1 text-xs font-bold uppercase">
              {monthlyDetailData?.expenses.length} hạng mục
            </p>
          </div>

          <ListExpense data={monthlyDetailData?.expenses} />
        </div>
      </Container>
    </div>
  );
};

export default MonthDetail;
