"use client";

import { Expense } from "@/interface/financeAPI";
import ExpenseItem from "./ExpenseItem";
import { useMemo } from "react";

interface ListExpenseProps {
  data?: Expense[];
  reload: () => void;
}

const ListExpense = (props: ListExpenseProps) => {
  const { data, reload } = props;

  const groupExpensesByDate = useMemo(() => {
    if (!data || data.length < 1) return [];
    const map = new Map<string, any[]>();

    data.forEach((item) => {
      const date = item.createdAt.slice(0, 10); // YYYY-MM-DD

      if (!map.has(date)) {
        map.set(date, []);
      }

      map.get(date)!.push(item);
    });

    return Array.from(map.entries()).map(([date, data]) => ({
      date,
      data,
    }));
  }, [data]);

  return (
    <div className="flex flex-col gap-4 flex-1">
      {groupExpensesByDate.length > 0 ? (
        groupExpensesByDate?.map((item) => (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-blue-6 font-medium bg-white px-5 py-2.5 rounded-sm shadow-sm">
              {item.date}
            </p>
            {item.data.map((expenseItem) => (
              <ExpenseItem
                data={expenseItem}
                key={expenseItem.id}
                reload={reload}
              />
            ))}
          </div>
        ))
      ) : (
        <div className="w-full rounded-2xl border border-gray-200 p-6 space-y-4 bg-white shadow-sm">
          <p className="text-base text-gray-2 font-bold">Không có chi tiêu</p>
        </div>
      )}
    </div>
  );
};

export default ListExpense;
