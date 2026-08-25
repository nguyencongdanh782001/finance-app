"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { MonthlyRevenue } from "@/interface/financeAPI";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyVND } from "@/helper/convertCurrency";

const CHART_Y_AXIS_WIDTH = 28;
const CHART_MIN_WIDTH_CLASS = "min-w-160";
const CHART_HEIGHT_CLASS = "h-65";
const CHART_HEIGHT_PX = 260;
const CHART_PLOT_TOP = 8;
const CHART_PLOT_BOTTOM = 36;

type Props = {
  data: MonthlyRevenue[];
  isLoading: boolean;
};

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
      className={`relative ${CHART_HEIGHT_CLASS} bg-white text-[10px] text-slate-500`}
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

export default function MonthlyRevenueChart({ data, isLoading }: Props) {
  const minRevenue = Math.min(0, ...data.map((d) => d.profit));
  const maxRevenue = Math.max(0, ...data.map((d) => d.profit));
  const { domain, ticks } = generateDomainTicks(minRevenue, maxRevenue);

  const longestLabel = ticks
    .map((v) => formatCompactNumber(v))
    .reduce((a, b) => (a.length > b.length ? a : b));

  const estimatedWidth = Math.max(
    longestLabel.length * 10.5,
    CHART_Y_AXIS_WIDTH,
  );
  const axisWidth = estimatedWidth + 16;
  const totalRevenue = data.reduce((sum, item) => sum + item.profit, 0);
  const chartConfig = {
    revenue: {
      label: "Doanh thu",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="rounded-[32px] bg-white p-4 shadow-sm sm:rounded-[40px] sm:p-5">
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-[28px] sm:rounded-[32px]" />
      ) : (
        <>
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h3 className="uppercase text-sm font-bold text-green-4">
                Doanh thu theo tháng
              </h3>
              <p className="mt-2 text-md font-black leading-none text-green-2">
                {formatCurrencyVND(totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tổng doanh thu trong năm
              </p>
            </div>
            <p className="shrink-0 uppercase text-xs font-bold text-green-4 sm:text-sm">
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
                  <BarChart data={data}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />

                    <XAxis
                      dataKey="month"
                      tickFormatter={(v) => `T${v}`}
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
                            const month = payload?.[0]?.payload?.month;
                            return month ? `Tháng ${month}` : "";
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
                      maxBarSize={24}
                    >
                      {data.map((item, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            item.profit >= 0
                              ? "var(--color-green-2)"
                              : "var(--color-red-1)"
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
  );
}
