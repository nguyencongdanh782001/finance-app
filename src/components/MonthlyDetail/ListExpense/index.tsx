"use client";

import { Expense } from "@/interface/financeAPI";
import ExpenseItem from "./ExpenseItem";

interface ListExpenseProps {
  data?: Expense[];
}

const ListExpense = (props: ListExpenseProps) => {
  const { data } = props;
  return (
    <div className="flex flex-col gap-4">
      {data?.map((item) => (
        <ExpenseItem data={item} key={item.id} />
      ))}
    </div>
  );
};

export default ListExpense;
