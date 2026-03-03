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
  profit: number;
};

export type YearlyRevenueResponse = {
  year: number;
  data: MonthlyRevenue[];
};

export interface CreateMonthlyExpenseRequest {
  name: string;
  amount: number | string;
}

export type UpdateMonthlyExpenseRequest = CreateMonthlyExpenseRequest;

export type DailyDetailResponse = {
  id: number;
  date: string;
  capitalCash: number;
  capitalBank: number;
  revenueCash: number;
  revenueBank: number;
  profitCash: number;
  profitBank: number;
  totalProfit: number;
};

export interface UpdateDailyRequest {
  capitalCash?: number | string;
  capitalBank?: number | string;
  revenueCash?: number | string;
  revenueBank?: number | string;
}
