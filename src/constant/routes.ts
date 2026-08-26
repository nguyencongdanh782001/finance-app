const APP_API_URL = (path: string) => {
  return `/api/${path}`;
};

export const API_ROUTES = {
  getYearProfit: (year: number) =>
    APP_API_URL(`summary/current-year?year=${year}`),
  getMonthlyData: (year: number, month: number) =>
    APP_API_URL(`monthly?year=${year}&month=${month}`),
  getYearlyRevenue: (year: number) =>
    APP_API_URL(`summary/yearly-revenue?year=${year}`),
  getYearlyExpense: (year: number) =>
    APP_API_URL(`summary/yearly-expense?year=${year}`),
  getTopSellingProducts: (year: number, month: number) =>
    APP_API_URL(`summary/top-products?year=${year}&month=${month}`),
  getMonthlyProductProfit: (year: number, month: number) =>
    APP_API_URL(`summary/monthly-product-profit?year=${year}&month=${month}`),
  getMonthlyDetailData: (id: number) => APP_API_URL(`monthly/detail/${id}`),
  putMonthlyDetailData: (id: number) =>
    APP_API_URL(`monthly/detail/${id}/expense`),
  putExpense: (id: number, expenseId: number) =>
    APP_API_URL(`monthly/detail/${id}/expense/${expenseId}`),
  deleteExpense: (id: number, expenseId: number) =>
    APP_API_URL(`monthly/detail/${id}/expense/${expenseId}`),
  getDailyDetailData: (id: number) => APP_API_URL(`daily/detail/${id}`),
  putDailyDetailData: (id: number) => APP_API_URL(`daily/detail/${id}`),
  putDailySoldProducts: (id: number) =>
    APP_API_URL(`daily/detail/${id}/products`),
  getCategoryList: APP_API_URL("category"),
  createCategory: APP_API_URL("category"),
  getCategoryDetail: (id: number) => APP_API_URL(`category/${id}`),
  updateCategory: (id: number) => APP_API_URL(`category/${id}`),
  deleteCategory: (id: number) => APP_API_URL(`category/${id}`),
  getProductList: APP_API_URL("product"),
  createProduct: APP_API_URL("product"),
  getProductDetail: (id: number) => APP_API_URL(`product/${id}`),
  updateProduct: (id: number) => APP_API_URL(`product/${id}`),
  deleteProduct: (id: number) => APP_API_URL(`product/${id}`),
  uploadFileCloudinary: APP_API_URL("upload/cloudinary"),
  authRegister: APP_API_URL("auth/register"),
  authLogin: APP_API_URL("auth/login"),
  authGoogleLogin: APP_API_URL("auth/google"),
  authVerify: APP_API_URL("auth/verify"),
  authForgotPassword: APP_API_URL("auth/forgot-password"),
  authResetPassword: APP_API_URL("auth/reset-password"),
  authRefresh: APP_API_URL("auth/refresh"),
  authLogout: APP_API_URL("auth/logout"),
};
