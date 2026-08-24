import type {
  DailyFinance,
  MonthlyFinance,
} from "@/app/generated/prisma/client";

export type MonthlyResponse = {
  id: number;
  days: DailyFinance[];
} & MonthlyFinance;

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
  soldProductsByDay: MonthlySoldProductsByDayItem[];
};

export interface MonthlySoldProductsByDayItem {
  dailyId: number;
  date: string;
  soldProducts: MonthlySoldProductItem[];
}

export interface MonthlySoldProductItem {
  productId: number;
  productTitle: string;
  categoryName: string;
  importPrice: number;
  sales: DailySoldProductSaleItem[];
}

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

export type MonthlyExpenseChartItem = {
  month: number;
  expense: number;
};

export type YearlyExpenseResponse = {
  year: number;
  data: MonthlyExpenseChartItem[];
};

export type TopSellingProduct = {
  productId: number;
  productTitle: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  profit: number;
};

export type TopSellingProductsResponse = {
  year: number;
  month: number;
  totalQuantity: number;
  items: TopSellingProduct[];
};

export type DailyProductProfitItem = {
  day: number;
  date: string;
  profit: number;
};

export type MonthlyProductProfitResponse = {
  year: number;
  month: number;
  totalProfit: number;
  data: DailyProductProfitItem[];
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
  note: string;
  soldProducts: DailySoldProductItem[];
  previousDay: DailyDetailNavigationItem | null;
  nextDay: DailyDetailNavigationItem | null;
};

export interface DailyDetailNavigationItem {
  id: number;
  date: string;
}

export interface UpdateDailyRequest {
  capitalCash?: number | string;
  capitalBank?: number | string;
  revenueCash?: number | string;
  revenueBank?: number | string;
  note?: string;
}

export interface DailySoldProductItem {
  productId: number;
  productTitle: string;
  productImageUrl: string;
  categoryName: string;
  importPrice: number;
  currentStock: number;
  availableStock: number;
  sales: DailySoldProductSaleItem[];
}

export interface DailySoldProductSaleItem {
  quantity: number;
  sellPrice: number;
}

export interface UpdateDailySoldProductsRequest {
  soldProducts: {
    productId: number;
    sales: {
      quantity: number;
      sellPrice: number;
    }[];
  }[];
}

export interface UpdateDailySoldProductsResponse {
  success: boolean;
  summary: {
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
  };
}

export interface UploadImageResponse {
  url: string;
  publicId: string;
}
