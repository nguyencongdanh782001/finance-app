const APP_API_URL = (path: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/${path}`;
};

export const API_ROUTES = {
  getYearProfit: APP_API_URL("summary/current-year"),
  getMonthlyData: (year: number, month: number) =>
    APP_API_URL(`monthly?year=${year}&month=${month}`),
  getYearlyRevenue: (year: number) =>
    APP_API_URL(`summary/yearly-revenue?year=${year}`),
  getMonthlyDetailData: (id: number) => APP_API_URL(`monthly/detail/${id}`),
  putMonthlyDetailData: (id: number) =>
    APP_API_URL(`monthly/detail/${id}/expense`),
};
