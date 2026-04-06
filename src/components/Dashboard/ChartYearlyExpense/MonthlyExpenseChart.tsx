"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { MonthlyExpenseChartItem } from "@/interface/financeAPI";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_Y_AXIS_WIDTH = 28;

type Props = {
  data: MonthlyExpenseChartItem[];
  isLoading: boolean;
};

function generateTicks(max: number, steps = 4) {
  return Array.from({ length: steps + 1 }, (_, i) => (max / steps) * i);
}

export default function MonthlyExpenseChart({ data, isLoading }: Props) {
  const ticks = generateTicks(Math.max(...data.map((d) => d.expense)));

  const longestLabel = ticks
    .map((value) => formatCompactNumber(value))
    .reduce((longest, current) =>
      longest.length > current.length ? longest : current,
    );

  const estimatedWidth = Math.max(
    longestLabel.length * 10.5,
    CHART_Y_AXIS_WIDTH,
  );

  return (
    <div className="rounded-[32px] bg-white p-4 shadow-sm sm:rounded-[40px] sm:p-5">
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-[28px] sm:rounded-[32px]" />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="uppercase text-sm font-bold text-green-4">
              Chi tiêu theo tháng
            </h3>
            <p className="shrink-0 uppercase text-xs font-bold text-green-4 sm:text-sm">
              Đơn vị: VND
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-160">
              <ChartContainer
                className="h-65 w-full"
                config={{
                  expense: {
                    label: "Chi tiêu",
                    color: "var(--color-orange-3)",
                  },
                }}
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
                    width={estimatedWidth}
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

                  <Bar dataKey="expense" radius={[10, 10, 0, 0]} maxBarSize={24}>
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
        </>
      )}
    </div>
  );
}
