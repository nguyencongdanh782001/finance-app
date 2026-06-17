"use client";

import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { TopSellingProductsResponse } from "@/interface/financeAPI";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

type TopSellingChartItem = TopSellingProductsResponse["items"][number] & {
  fill: string;
};

const PIE_COLORS = [
  "var(--color-green-2)",
  "var(--color-orange-3)",
  "var(--color-blue-2)",
  "#77C3A6",
  "#FFD166",
  "#7CC6FE",
];

export default function TopSellingProductsChart() {
  const now = new Date();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlYear = Number(searchParams.get("year"));
  const urlMonth = Number(searchParams.get("month"));
  const year = urlYear || now.getFullYear();
  const month = urlMonth || now.getMonth() + 1;

  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<TopSellingProductsResponse | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await financeAPI.getTopSellingProducts(year, month);

      if (res.code === RESPONSE_CODES.success) {
        setData(res.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [year, month, pathname, searchParams.toString()]);

  const chartData = useMemo(() => {
    const items = data?.items ?? [];
    const topItems: TopSellingChartItem[] = items
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }));
    const remainingItems = items.slice(5);

    if (remainingItems.length === 0) {
      return topItems;
    }

    const others = remainingItems.reduce<TopSellingChartItem>(
      (acc, item) => {
        acc.quantity += item.quantity;
        acc.revenue += item.revenue;
        acc.profit += item.profit;
        return acc;
      },
      {
        productId: 0,
        productTitle: "Sản phẩm khác",
        categoryName: "Tổng hợp",
        quantity: 0,
        revenue: 0,
        profit: 0,
        fill: PIE_COLORS[5],
      },
    );

    return [...topItems, others];
  }, [data?.items]);

  const orderDetailData = useMemo(() => {
    const items = data?.items ?? [];
    const remainingItems = items.slice(5);

    return remainingItems;
  }, [data?.items]);

  const totalQuantity = data?.totalQuantity ?? 0;
  const hasData = chartData.length > 0 && totalQuantity > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="uppercase text-sm text-gray-2 font-extrabold sm:text-base">
          Sản phẩm bán chạy
        </p>
        <p className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold uppercase text-green-2 sm:text-sm">
          Tháng {month}, {year}
        </p>
      </div>

      <div className="rounded-[32px] bg-white p-4 shadow-sm sm:rounded-[40px] sm:p-5">
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-5">
            <Skeleton className="h-64 w-full rounded-[28px] sm:h-72 sm:rounded-[32px]" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-18 w-full rounded-[24px]" />
              <Skeleton className="h-18 w-full rounded-[24px]" />
              <Skeleton className="h-18 w-full rounded-[24px]" />
            </div>
          </div>
        ) : hasData ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-5">
            <div className="rounded-[28px] bg-linear-to-br from-green-12 via-white to-orange-1/15 p-3 sm:rounded-[32px] sm:p-4">
              <ChartContainer
                className="mx-auto h-60 w-full max-w-[320px] sm:h-72 sm:max-w-105"
                config={{
                  quantity: {
                    label: "Số lượng bán",
                    color: PIE_COLORS[0],
                  },
                }}
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(_, __, item) => {
                          const payload = item.payload as TopSellingChartItem;
                          const percent = totalQuantity
                            ? (
                                (payload.quantity / totalQuantity) *
                                100
                              ).toFixed(1)
                            : "0.0";

                          return (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-2">
                                {payload.productTitle}
                              </span>
                              <span>
                                {payload.quantity.toLocaleString("vi-VN")} sản
                                phẩm
                              </span>
                              <span>{percent}% tổng số lượng</span>
                              <span>{formatCurrencyVND(payload.revenue)}</span>
                            </div>
                          );
                        }}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="quantity"
                    nameKey="productTitle"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {chartData.map((item) => (
                      <Cell key={item.productTitle} fill={item.fill} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: "var(--color-gray-2)" }}
                    className="text-sm font-bold"
                  >
                    Tổng bán
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: "var(--color-green-2)" }}
                    className="text-2xl font-extrabold"
                  >
                    {totalQuantity.toLocaleString("vi-VN")}
                  </text>
                </PieChart>
              </ChartContainer>
            </div>

            <div className="flex flex-col gap-3">
              {chartData.map((item, index) => {
                const percent = totalQuantity
                  ? ((item.quantity / totalQuantity) * 100).toFixed(1)
                  : "0.0";

                return index < chartData.length - 1 ? (
                  <div
                    key={item.productTitle}
                    className="rounded-[20px] border border-gray-200 bg-linear-to-r from-white to-slate-50 px-3 py-3 shadow-sm sm:rounded-[24px] sm:px-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div className="min-w-0 flex flex-col">
                          <p className="text-sm font-extrabold text-gray-2 wrap-break-word">
                            #{index + 1} {item.productTitle}
                          </p>
                          <p className="text-xs font-medium uppercase text-green-1 wrap-break-word">
                            {item.categoryName}
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 rounded-full bg-green-12 px-2.5 py-1 text-xs font-bold text-green-2">
                        {percent}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-4xl bg-white p-2"
                    style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}
                    onClick={() => setIsExpanded((prev) => !prev)}
                  >
                    <div
                      key={item.productTitle}
                      className="cursor-pointer! rounded-[20px] border border-gray-200 bg-linear-to-r from-white to-slate-50 px-3 py-3 shadow-sm sm:rounded-[24px] sm:px-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <div className="min-w-0 flex flex-col">
                            <p className="text-sm font-extrabold text-gray-2 wrap-break-word">
                              #{index + 1} {item.productTitle}
                            </p>
                            <p className="text-xs font-medium uppercase text-green-1 wrap-break-word">
                              {item.categoryName}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 rounded-full bg-green-12 px-2.5 py-1 text-xs font-bold text-green-2">
                          {percent}%
                        </p>
                      </div>
                    </div>

                    <div
                      className={`grid overflow-auto transition-[grid-template-rows,opacity,margin] duration-200 ease-out gap-3 ${
                        isExpanded
                          ? "mt-3 grid-rows-[1fr] opacity-100 max-h-60"
                          : "mt-0 grid-rows-[0fr] opacity-0 max-h-0"
                      }`}
                      aria-hidden={!isExpanded}
                    >
                      {orderDetailData?.map((itemOrder, indexOrder) => {
                        const percentOrder = totalQuantity
                          ? (
                              (itemOrder.quantity / totalQuantity) *
                              100
                            ).toFixed(1)
                          : "0.0";
                        return (
                          <div
                            key={itemOrder.productTitle}
                            className="rounded-[20px] border border-gray-200 bg-linear-to-r from-white to-slate-50 px-3 py-3 shadow-sm sm:rounded-[24px] sm:px-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex flex-col">
                                  <p className="text-sm font-extrabold text-gray-2 wrap-break-word">
                                    #{indexOrder + 1} {itemOrder.productTitle}
                                  </p>
                                  <p className="text-xs font-medium uppercase text-green-1 wrap-break-word">
                                    {itemOrder.categoryName}
                                  </p>
                                </div>
                              </div>
                              <p className="shrink-0 rounded-full bg-green-12 px-2.5 py-1 text-xs font-bold text-green-2">
                                {percentOrder}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] bg-linear-to-br from-slate-50 to-white px-5 text-center sm:min-h-72 sm:rounded-[32px] sm:px-6">
            <p className="text-base font-extrabold uppercase text-gray-2">
              Chưa có dữ liệu bán sản phẩm
            </p>
            <p className="mt-2 text-sm font-medium text-green-1">
              Hãy nhập sản phẩm bán trong tháng để xem biểu đồ bán chạy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
