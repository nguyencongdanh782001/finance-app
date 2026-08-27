"use client";

import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
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
const CHART_MIN_WIDTH_CLASS = "min-w-160";
const CHART_HEIGHT_CLASS = "h-72";
const CHART_HEIGHT_PX = 288;
const CHART_PLOT_TOP = 8;
const CHART_PLOT_BOTTOM = 36;

function generateTicks(max: number, steps = 4) {
  return Array.from({ length: steps + 1 }, (_, i) => (max / steps) * i);
}

function generateDomainTicks(min: number, max: number, steps = 4) {
  const lower = Math.min(0, min);
  const upper = Math.max(0, max);
  const range = upper - lower;

  if (range === 0) {
    return {
      domain: [0, 0] as [number, number],
      ticks: generateTicks(0, steps),
    };
  }

  return {
    domain: [lower, upper] as [number, number],
    ticks: Array.from(
      { length: steps + 1 },
      (_, index) => lower + (range / steps) * index,
    ),
  };
}

function StickyYAxisLabels({
  axisWidth,
  domain,
  ticks,
}: {
  axisWidth: number;
  domain: [number, number];
  ticks: number[];
}) {
  const [min, max] = domain;
  const range = max - min;
  const plotHeight = CHART_HEIGHT_PX - CHART_PLOT_TOP - CHART_PLOT_BOTTOM;

  return (
    <div
      className={`relative ${CHART_HEIGHT_CLASS} bg-white text-10px text-slate-500`}
      style={{ width: axisWidth }}
    >
      {ticks
        .filter((tick) => tick !== 0)
        .map((tick) => {
          const ratio = range === 0 ? 1 : (tick - min) / range;
          const top = CHART_PLOT_TOP + (1 - ratio) * plotHeight;

          return (
            <span
              key={tick}
              className="absolute right-2 whitespace-nowrap leading-none"
              style={{ top, transform: "translateY(-50%)" }}
            >
              {formatCompactNumber(tick)}
            </span>
          );
        })}
    </div>
  );
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
  const totalProfit = data?.totalProfit ?? 0;

  const minProfit = Math.min(0, ...chartData.map((d) => d.profit));
  const maxProfit = Math.max(0, ...chartData.map((d) => d.profit));
  const { domain, ticks } = generateDomainTicks(minProfit, maxProfit);

  const longestLabel = ticks
    .map((v) => formatCompactNumber(v))
    .reduce((a, b) => (a.length > b.length ? a : b));

  const estimatedWidth = Math.max(
    longestLabel.length * 10.5,
    CHART_Y_AXIS_WIDTH,
  );
  const axisWidth = estimatedWidth + 16;
  const chartConfig = {
    profit: {
      label: "Lợi nhuận",
      color: "var(--color-green-2)",
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-slate-800">
          Lợi nhuận theo ngày
        </p>
        <p className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary">
          Tháng {month}, {year}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-500">
                  Lợi nhuận sản phẩm theo ngày
                </h3>
                <p
                  className={`mt-2 text-md font-black leading-none ${totalProfit < 0 ? "text-red-1" : "text-green-13"}`}
                >
                  {totalProfit > 0 ? "+" : ""}
                  {formatCurrencyVND(totalProfit)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Tổng lợi nhuận trong tháng
                </p>
              </div>
              <p className="shrink-0 text-xs font-medium text-slate-400 sm:text-sm">
                Đơn vị: VND
              </p>
            </div>

            <div className="overflow-x-auto">
              <div
                className="flex"
                style={{ minWidth: `calc(40rem + ${axisWidth}px)` }}
              >
                <div
                  className="sticky left-0 z-10 shrink-0 bg-white"
                  style={{ width: axisWidth }}
                >
                  <StickyYAxisLabels
                    axisWidth={axisWidth}
                    domain={domain}
                    ticks={ticks}
                  />
                </div>

                <div className={`${CHART_MIN_WIDTH_CLASS} flex-1`}>
                  <ChartContainer
                    className={`${CHART_HEIGHT_CLASS} w-full`}
                    config={chartConfig}
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
                        hide
                        width={0}
                        ticks={ticks}
                        domain={domain}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
