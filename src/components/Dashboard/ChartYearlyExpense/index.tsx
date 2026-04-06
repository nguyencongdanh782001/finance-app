"use client";

import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { YearlyExpenseResponse } from "@/interface/financeAPI";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MonthlyExpenseChart from "./MonthlyExpenseChart";

const ChartYearlyExpense = ({ isLoading }: { isLoading: boolean }) => {
  const now = new Date();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlYear = Number(searchParams.get("year"));
  const defaultYear = urlYear || now.getFullYear();
  const [yearlyExpenseData, setYearlyExpenseData] = useState<
    YearlyExpenseResponse | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const res = await financeAPI.getYearlyExpense(defaultYear);
      if (res.code === RESPONSE_CODES.success) {
        setYearlyExpenseData(res.data);
      }
    };
    if (!isLoading) fetchData();
  }, [defaultYear, searchParams.toString(), pathname.toString(), isLoading]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="uppercase text-base text-gray-2 font-extrabold">
          Chi tiêu các tháng
        </p>
        <p className="px-3 py-1.5 rounded-full bg-white text-sm text-green-2 font-bold uppercase">
          Năm {defaultYear}
        </p>
      </div>
      <MonthlyExpenseChart
        data={yearlyExpenseData?.data || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChartYearlyExpense;
