"use client";

import { Expense } from "@/interface/financeAPI";
import ExpenseItem from "./ExpenseItem";

interface ListExpenseProps {
  data?: Expense[];
  reload: () => void;
}

const ListExpense = (props: ListExpenseProps) => {
  const { data, reload } = props;
  return (
    <div className="flex flex-col gap-4">
      {data && data?.length > 0 ? (
        data?.map((item) => (
          <ExpenseItem data={item} key={item.id} reload={reload} />
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
