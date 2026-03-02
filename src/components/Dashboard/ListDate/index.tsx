"use client";
import { MonthlyResponse } from "@/interface/financeAPI";
import SelectMontYear from "../SelectMontYear";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { financeAPI } from "@/endpoint/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import BlockDate from "./BlockDate";

const ListDate = () => {
  const now = new Date();
  const searchParams = useSearchParams();
  const urlYear = Number(searchParams.get("year"));
  const urlMonth = Number(searchParams.get("month"));
  const defaultYear = urlYear || now.getFullYear();

  const defaultMonth = urlMonth || now.getMonth() + 1;

  const [monthlyData, setMonthlyData] = useState<MonthlyResponse | undefined>(
    undefined,
  );
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await financeAPI.getMonthlyData(year, month);
      if (res.code === RESPONSE_CODES.success) {
        setMonthlyData(res.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [year, month]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="uppercase text-base text-gray-2 font-extrabold">
          Chi Tiết Tháng
        </p>
        <SelectMontYear
          year={year}
          month={month}
          setYear={setYear}
          setMonth={setMonth}
          id={monthlyData?.id}
        />
      </div>
      <BlockDate
        year={year}
        month={month}
        days={monthlyData?.days || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ListDate;
