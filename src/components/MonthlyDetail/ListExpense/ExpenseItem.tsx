"use client";

import { TZ_TEMPLATE } from "@/constant/date";
import { formatTZ } from "@/helper/date";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { Expense } from "@/interface/financeAPI";

interface ExpenseItemProps {
  data?: Expense;
}
const ExpenseItem = (props: ExpenseItemProps) => {
  const { data } = props;
  return (
    <div className="flex flex-col bg-white shadow-md p-5 rounded-[32px]">
      <p className="text-base text-gray-7 font-bold">{data?.name}</p>
      <p className="text-xs text-green-1 font-medium">
        {formatTZ(data?.createdAt || "", TZ_TEMPLATE.year_month_day)}
      </p>
      <p className="text-base text-gray-2 font-bold">
        {formatCompactNumber(data?.amount || 0)} VND
      </p>
    </div>
  );
};

export default ExpenseItem;
