"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { MonthlyRevenue } from "@/interface/financeAPI";
import { formatCompactNumber } from "@/helper/formatCompactNumber";

type Props = {
  data: MonthlyRevenue[];
};

function generateTicks(max: number, steps = 4) {
  return Array.from({ length: steps + 1 }, (_, i) => (max / steps) * i);
}

export default function MonthlyRevenueChart({ data }: Props) {
  const ticks = generateTicks(Math.max(...data.map((d) => d.profit)));

  const longestLabel = ticks
    .map((v) => formatCompactNumber(v))
    .reduce((a, b) => (a.length > b.length ? a : b));

  const estimatedWidth = longestLabel.length * 10.5;

  return (
    <div className="rounded-[40px] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="uppercase text-sm font-bold text-green-4">
          Lợi nhuận theo tháng
        </h3>
        <p className="uppercase text-sm font-bold text-green-4">đơn vị: VND</p>
      </div>

      {/* Scroll container */}
      <div className="overflow-x-auto">
        <div className="min-w-160">
          <ChartContainer
            className="h-65 w-full"
            config={{
              revenue: {
                label: "Lợi nhuận",
                color: "hsl(var(--chart-1))",
              },
            }}
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
                    formatter={(value) => formatCompactNumber(Number(value))}
                  />
                }
              />

              <Bar dataKey="profit" radius={[10, 10, 0, 0]} maxBarSize={24}>
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
  );
}
