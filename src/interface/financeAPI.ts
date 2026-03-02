import { DailyFinance, MonthlyFinance } from "@/app/generated/prisma/client";

export type MonthlyResponse = {
  id: number;
  monthly: MonthlyFinance;
  days: DailyFinance[];
};

export type Expense = {
  id: number;
  name: string;
  amount: number;
  createdAt: string;
};

export type MonthlyDetailResponse = {
  id: number;
  year: number;
  month: number;
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  expenses: Expense[];
};

export type YearProfitResponse = {
  year: number;
  totalProfit: number;
};

export type MonthlyRevenue = {
  month: number;
  totalRevenue: number;
};

export type YearlyRevenueResponse = {
  year: number;
  data: MonthlyRevenue[];
};

export interface CreateMonthlyExpenseRequest {
  name: string;
  amount: number | "";
}
