import { IAPIResponse } from "@/interface/APIResponse";
import {
  CreateMonthlyExpenseRequest,
  MonthlyDetailResponse,
  MonthlyResponse,
  YearlyRevenueResponse,
  YearProfitResponse,
} from "@/interface/financeAPI";
import appAxios from "./appAxios";
import { API_ROUTES } from "@/constant/routes";

export const financeAPI = {
  getYearProfit: (): Promise<IAPIResponse<YearProfitResponse>> => {
    return appAxios.get(API_ROUTES.getYearProfit);
  },
  getMonthlyData: (
    year: number,
    month: number,
  ): Promise<IAPIResponse<MonthlyResponse>> => {
    return appAxios.get(API_ROUTES.getMonthlyData(year, month));
  },
  getYearlyRevenue: (
    year: number,
  ): Promise<IAPIResponse<YearlyRevenueResponse>> => {
    return appAxios.get(API_ROUTES.getYearlyRevenue(year));
  },
  getMonthlyDetailData: (
    id: number,
  ): Promise<IAPIResponse<MonthlyDetailResponse>> => {
    return appAxios.get(API_ROUTES.getMonthlyDetailData(id));
  },
  putMonthlyDetailData: (
    id: number,
    payload: CreateMonthlyExpenseRequest,
  ): Promise<IAPIResponse<unknown>> => {
    return appAxios.put(API_ROUTES.putMonthlyDetailData(id), payload);
  },
};
