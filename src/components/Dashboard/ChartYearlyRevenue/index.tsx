"use client";

import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { YearlyRevenueResponse } from "@/interface/financeAPI";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MonthlyRevenueChart from "./MonthlyRevenueChart";

const ChartYearlyRevenue = () => {
  const now = new Date();
  const searchParams = useSearchParams();
  const urlYear = Number(searchParams.get("year"));
  const defaultYear = urlYear || now.getFullYear();
  const [yearlyRevenueData, setYearlyRevenueData] = useState<
    YearlyRevenueResponse | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const res = await financeAPI.getYearlyRevenue(defaultYear);
      if (res.code === RESPONSE_CODES.success) {
        setYearlyRevenueData(res.data);
      }
    };
    fetchData();
  }, [defaultYear]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="uppercase text-base text-gray-2 font-extrabold">
          Thống kê chi tiết các tháng
        </p>
        <p className="px-3 py-1.5 rounded-full bg-white text-sm text-green-2 font-bold uppercase">
          Năm {defaultYear}
        </p>
      </div>
      <MonthlyRevenueChart data={yearlyRevenueData?.data || []} />
    </div>
  );
};

export default ChartYearlyRevenue;
