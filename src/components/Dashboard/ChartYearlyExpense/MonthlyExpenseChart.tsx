"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { MonthlyExpenseChartItem } from "@/interface/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_Y_AXIS_WIDTH = 28;
const CHART_MIN_WIDTH_CLASS = "min-w-160";
const CHART_HEIGHT_CLASS = "h-65";
const CHART_HEIGHT_PX = 260;
const CHART_PLOT_TOP = 8;
const CHART_PLOT_BOTTOM = 36;

type Props = {
  data: MonthlyExpenseChartItem[];
  isLoading: boolean;
};

function generateTicks(max: number, steps = 4) {
  return Array.from({ length: steps + 1 }, (_, i) => (max / steps) * i);
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

export default function MonthlyExpenseChart({ data, isLoading }: Props) {
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const maxExpense = Math.max(0, ...data.map((d) => d.expense));
  const ticks = generateTicks(maxExpense);

  const longestLabel = ticks
    .map((value) => formatCompactNumber(value))
    .reduce((longest, current) =>
      longest.length > current.length ? longest : current,
    );

  const estimatedWidth = Math.max(
    longestLabel.length * 10.5,
    CHART_Y_AXIS_WIDTH,
  );
  const axisWidth = estimatedWidth + 16;
  const domain: [number, number] = [0, maxExpense];
  const chartConfig = {
    expense: {
      label: "Chi tiêu",
      color: "var(--color-orange-3)",
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
                Chi tiêu theo tháng
              </h3>
              <p className="mt-2 text-md font-black leading-none text-orange-3">
                {formatCurrencyVND(totalExpense)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tổng chi tiêu trong năm
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
                      tickFormatter={(value) => `T${value}`}
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
                      dataKey="expense"
                      radius={[10, 10, 0, 0]}
                      maxBarSize={24}
                    >
                      {data.map((item, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            item.expense > 0
                              ? "var(--color-orange-3)"
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
  );
}
