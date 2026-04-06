"use client";

import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { MonthlyProductProfitResponse } from "@/interface/financeAPI";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_Y_AXIS_WIDTH = 28;

function generateTicks(max: number, steps = 4) {
  return Array.from({ length: steps + 1 }, (_, i) => (max / steps) * i);
}

export default function ChartMonthlyProductProfit() {
  const now = new Date();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlYear = Number(searchParams.get("year"));
  const urlMonth = Number(searchParams.get("month"));
  const year = urlYear || now.getFullYear();
  const month = urlMonth || now.getMonth() + 1;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<MonthlyProductProfitResponse | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await financeAPI.getMonthlyProductProfit(year, month);

      if (res.code === RESPONSE_CODES.success) {
        setData(res.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [year, month, pathname, searchParams.toString()]);

  const chartData = data?.data ?? [];

  const ticks = generateTicks(Math.max(...chartData.map((d) => d.profit)));

  const longestLabel = ticks
    .map((v) => formatCompactNumber(v))
    .reduce((a, b) => (a.length > b.length ? a : b));

  const estimatedWidth = Math.max(longestLabel.length * 10.5);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="uppercase text-sm text-gray-2 font-extrabold sm:text-base">
          Lợi nhuận theo ngày
        </p>
        <p className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm! font-bold uppercase text-green-2">
          Tháng {month}, {year}
        </p>
      </div>

      <div className="rounded-[32px] bg-white p-4 shadow-sm sm:rounded-[40px] sm:p-5">
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-[28px] sm:rounded-[32px]" />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase text-green-4">
                Lợi nhuận bán sản phẩm theo ngày
              </h3>
              <p className="shrink-0 text-xs font-bold uppercase text-green-4 sm:text-sm">
                Đơn vị: VND
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-160">
                <ChartContainer
                  className="h-72 w-full"
                  config={{
                    profit: {
                      label: "Lợi nhuận",
                      color: "var(--color-green-2)",
                    },
                  }}
                >
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(value) => `${value}`}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis
                      width={estimatedWidth}
                      tickFormatter={formatCompactNumber}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_, payload) => {
                            const item = payload?.[0]?.payload as
                              | MonthlyProductProfitResponse["data"][number]
                              | undefined;
                            return item
                              ? `Ngày ${item.day}/${String(month).padStart(2, "0")}/${year}`
                              : "";
                          }}
                          formatter={(value) =>
                            formatCompactNumber(Number(value))
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey="profit"
                      radius={[10, 10, 0, 0]}
                      maxBarSize={20}
                    >
                      {chartData.map((item) => (
                        <Cell
                          key={`${item.day}-${item.date}`}
                          fill={
                            item.profit > 0
                              ? "var(--color-green-2)"
                              : item.profit < 0
                                ? "var(--color-red-1)"
                                : "var(--color-gray-8)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
