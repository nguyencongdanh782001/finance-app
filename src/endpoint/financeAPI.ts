import { IAPIResponse } from "@/interface/APIResponse";
import {
  CreateMonthlyExpenseRequest,
  MonthlyProductProfitResponse,
  DailyDetailResponse,
  DailyOrder,
  DailyOrderListResponse,
  DailySoldProductGroupListResponse,
  MonthlyDetailResponse,
  MonthlyResponse,
  OfflineOrderPayload,
  UpdateDailyRequest,
  UploadImageResponse,
  TopSellingProductsResponse,
  YearlyExpenseResponse,
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
  ProductStatus,
} from "@/interface/product";
import {
  AuthPurpose,
  GoogleLoginResponse,
  LoginResponse,
  RegisterResponse,
  VerifyOtpResponse,
} from "@/interface/auth";
import { authTokenStorage } from "./appAxios";

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
  getYearlyExpense: (
    year: number,
  ): Promise<IAPIResponse<YearlyExpenseResponse>> => {
    return appAxios.get(API_ROUTES.getYearlyExpense(year));
  },
  getTopSellingProducts: (
    year: number,
    month: number,
  ): Promise<IAPIResponse<TopSellingProductsResponse>> => {
    return appAxios.get(API_ROUTES.getTopSellingProducts(year, month));
  },
  getMonthlyProductProfit: (
    year: number,
    month: number,
  ): Promise<IAPIResponse<MonthlyProductProfitResponse>> => {
    return appAxios.get(API_ROUTES.getMonthlyProductProfit(year, month));
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
  getDailyOrders: (
    id: number,
    params?: {
      search?: string;
      source?: string;
      status?: string;
      paymentStatus?: string;
      paymentMethod?: string;
    },
  ): Promise<IAPIResponse<DailyOrderListResponse>> => {
    return appAxios.get(API_ROUTES.getDailyOrders(id), { params });
  },
  getDailySoldProductGroups: (
    id: number,
    params?: {
      search?: string;
      source?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<IAPIResponse<DailySoldProductGroupListResponse>> => {
    return appAxios.get(API_ROUTES.getDailySoldProductGroups(id), { params });
  },
  createDailyOrder: (
    id: number,
    payload: OfflineOrderPayload,
  ): Promise<IAPIResponse<DailyOrder>> => {
    return appAxios.post(API_ROUTES.createDailyOrder(id), payload);
  },
  updateOrder: (
    id: number,
    payload: OfflineOrderPayload,
  ): Promise<IAPIResponse<DailyOrder>> => {
    return appAxios.patch(API_ROUTES.updateOrder(id), payload);
  },
  updateOrderStatus: (
    id: number,
    payload: { status: string },
  ): Promise<IAPIResponse<DailyOrder>> => {
    return appAxios.patch(API_ROUTES.updateOrder(id), payload);
  },
  getOrderDetail: (id: number): Promise<IAPIResponse<DailyOrder>> => {
    return appAxios.get(API_ROUTES.getOrderDetail(id));
  },
  cancelOrder: (
    id: number,
    reason: string,
  ): Promise<IAPIResponse<DailyOrder>> => {
    return appAxios.post(API_ROUTES.cancelOrder(id), { reason });
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
  ): Promise<IAPIResponse<ProductApiItem>> => {
    return appAxios.patch(API_ROUTES.updateProduct(id), payload);
  },
  updateProductStatus: (
    id: number,
    productStatus: ProductStatus,
  ): Promise<IAPIResponse<{ id: number; productStatus: ProductStatus }>> => {
    return appAxios.patch(API_ROUTES.updateProductStatus(id), {
      productStatus,
    });
  },
  deleteProduct: (
    id: number,
  ): Promise<IAPIResponse<{ success?: boolean; message?: string }>> => {
    return appAxios.delete(API_ROUTES.deleteProduct(id));
  },
  register: (payload: {
    email: string;
    phone: string;
    password: string;
    displayName: string;
    birthday: string;
    gender: "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";
  }): Promise<IAPIResponse<RegisterResponse>> => {
    return appAxios.post(API_ROUTES.authRegister, payload, {
      headers: { "Un-Authorized": true },
    });
  },
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<IAPIResponse<LoginResponse>> => {
    const response = (await appAxios.post(API_ROUTES.authLogin, payload, {
      headers: { "Un-Authorized": true },
    })) as unknown as IAPIResponse<LoginResponse>;

    if (response.data?.accessToken) {
      authTokenStorage.setAccessToken(response.data.accessToken);
    }

    return response;
  },
  verifyOtp: async (payload: {
    email: string;
    code: string;
    purpose?: AuthPurpose;
  }): Promise<IAPIResponse<VerifyOtpResponse>> => {
    const response = (await appAxios.post(API_ROUTES.authVerify, payload, {
      headers: { "Un-Authorized": true },
    })) as unknown as IAPIResponse<VerifyOtpResponse>;

    if (response.data?.accessToken) {
      authTokenStorage.setAccessToken(response.data.accessToken);
    }

    return response;
  },
  googleLogin: async (payload: {
    credential: string;
  }): Promise<IAPIResponse<GoogleLoginResponse>> => {
    const response = (await appAxios.post(API_ROUTES.authGoogleLogin, payload, {
      headers: { "Un-Authorized": true },
    })) as unknown as IAPIResponse<GoogleLoginResponse>;

    if (response.data?.accessToken) {
      authTokenStorage.setAccessToken(response.data.accessToken);
    }

    return response;
  },
  forgotPassword: (payload: {
    email: string;
  }): Promise<
    IAPIResponse<{
      success: boolean;
      message: string;
      email?: { sent: boolean; skipped: boolean; error?: string };
      devOtp?: string;
    }>
  > => {
    return appAxios.post(API_ROUTES.authForgotPassword, payload, {
      headers: { "Un-Authorized": true },
    });
  },
  resetPassword: (payload: {
    email: string;
    code: string;
    password: string;
  }): Promise<IAPIResponse<{ success: boolean; message?: string }>> => {
    return appAxios.post(API_ROUTES.authResetPassword, payload, {
      headers: { "Un-Authorized": true },
    });
  },
  refreshSession: async (): Promise<IAPIResponse<VerifyOtpResponse>> => {
    const response = (await appAxios.post(
      API_ROUTES.authRefresh,
      {},
      {
        headers: { "Un-Authorized": true },
      },
    )) as unknown as IAPIResponse<VerifyOtpResponse>;

    if (response.data?.accessToken) {
      authTokenStorage.setAccessToken(response.data.accessToken);
    }

    return response;
  },
  logout: async (): Promise<IAPIResponse<{ success: boolean }>> => {
    const response = (await appAxios.post(
      API_ROUTES.authLogout,
    )) as unknown as IAPIResponse<{ success: boolean }>;
    authTokenStorage.clearAccessToken();

    return response;
  },

  // UPLOAD IMAGE
  uploadImage: async (
    file: File,
  ): Promise<IAPIResponse<UploadImageResponse>> => {
    const formData = new FormData();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 70_000);

    formData.append("file", file);
    try {
      const res = await fetch(API_ROUTES.uploadFileCloudinary, {
        method: "POST",
        body: formData,
        credentials: "include",
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url || !data.publicId) {
        return { code: res.status.toString(), data: undefined };
      }
      return {
        code: res.status.toString(),
        data: { url: data.url, publicId: data.publicId },
      };
    } catch {
      return { code: "0", data: undefined };
    } finally {
      window.clearTimeout(timeout);
    }
  },
  deleteUploadedImage: async (
    publicId: string,
  ): Promise<IAPIResponse<{ success: boolean }>> => {
    const res = await fetch(API_ROUTES.uploadFileCloudinary, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await res.json();

    return {
      code: JSON.stringify(res.status),
      data,
    };
  },
};
