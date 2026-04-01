import { IAPIResponse } from "@/interface/APIResponse";
import {
  CreateMonthlyExpenseRequest,
  DailyDetailResponse,
  MonthlyDetailResponse,
  MonthlyResponse,
  UpdateDailySoldProductsRequest,
  UpdateDailySoldProductsResponse,
  UpdateDailyRequest,
  UploadImageResponse,
  YearlyRevenueResponse,
  YearProfitResponse,
} from "@/interface/financeAPI";
import appAxios from "./appAxios";
import { API_ROUTES } from "@/constant/routes";
import { CategoryApiItem, CategoryPayload } from "@/interface/category";
import {
  ProductApiItem,
  ProductListResponse,
  ProductPayload,
} from "@/interface/product";

export const financeAPI = {
  getYearProfit: (year: number): Promise<IAPIResponse<YearProfitResponse>> => {
    return appAxios.get(API_ROUTES.getYearProfit(year));
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
  putExpenseData: (
    id: number,
    expenseId: number,
    payload: CreateMonthlyExpenseRequest,
  ): Promise<IAPIResponse<unknown>> => {
    return appAxios.put(API_ROUTES.putExpense(id, expenseId), payload);
  },
  deleteExpense: (
    id: number,
    expenseId: number,
  ): Promise<IAPIResponse<unknown>> => {
    return appAxios.delete(API_ROUTES.deleteExpense(id, expenseId));
  },
  getDailyDetailData: (
    id: number,
  ): Promise<IAPIResponse<DailyDetailResponse>> => {
    return appAxios.get(API_ROUTES.getDailyDetailData(id));
  },
  putDailyDetailData: (
    id: number,
    payload: UpdateDailyRequest,
  ): Promise<IAPIResponse<unknown>> => {
    return appAxios.put(API_ROUTES.putDailyDetailData(id), payload);
  },
  putDailySoldProducts: (
    id: number,
    payload: UpdateDailySoldProductsRequest,
  ): Promise<IAPIResponse<UpdateDailySoldProductsResponse>> => {
    return appAxios.put(API_ROUTES.putDailySoldProducts(id), payload);
  },
  getCategoryList: (): Promise<IAPIResponse<CategoryApiItem[]>> => {
    return appAxios.get(API_ROUTES.getCategoryList);
  },
  getCategoryDetail: (id: number): Promise<IAPIResponse<CategoryApiItem>> => {
    return appAxios.get(API_ROUTES.getCategoryDetail(id));
  },
  createCategory: (
    payload: CategoryPayload,
  ): Promise<IAPIResponse<CategoryApiItem>> => {
    return appAxios.post(API_ROUTES.createCategory, payload);
  },
  updateCategory: (
    id: number,
    payload: CategoryPayload,
  ): Promise<IAPIResponse<CategoryApiItem>> => {
    return appAxios.put(API_ROUTES.updateCategory(id), payload);
  },
  deleteCategory: (id: number): Promise<IAPIResponse<{ message: string }>> => {
    return appAxios.delete(API_ROUTES.deleteCategory(id));
  },
  getProductList: (params?: {
    search?: string;
    categoryId?: number;
    sort?: "title-asc" | "title-desc" | "createdAt-desc" | "createdAt-asc";
    page?: number;
    limit?: number;
  }): Promise<IAPIResponse<ProductListResponse>> => {
    return appAxios.get(API_ROUTES.getProductList, { params });
  },
  getProductDetail: (id: number): Promise<IAPIResponse<ProductApiItem>> => {
    return appAxios.get(API_ROUTES.getProductDetail(id));
  },
  createProduct: (
    payload: ProductPayload,
  ): Promise<IAPIResponse<ProductApiItem>> => {
    return appAxios.post(API_ROUTES.createProduct, payload);
  },
  updateProduct: (
    id: number,
    payload: ProductPayload,
  ): Promise<IAPIResponse<{ success: boolean }>> => {
    return appAxios.put(API_ROUTES.updateProduct(id), payload);
  },
  deleteProduct: (id: number): Promise<IAPIResponse<{ success: boolean }>> => {
    return appAxios.delete(API_ROUTES.deleteProduct(id));
  },

  // UPLOAD IMAGE
  uploadImage: async (
    file: File,
  ): Promise<IAPIResponse<UploadImageResponse>> => {
    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch(API_ROUTES.uploadFileCloudinary, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    return {
      code: JSON.stringify(res.status),
      data: {
        url: data.url,
        publicId: data.publicId,
      },
    };
  },
};
