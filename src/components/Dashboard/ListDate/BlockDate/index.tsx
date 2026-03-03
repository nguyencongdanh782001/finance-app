"use client";

import { DailyFinance } from "@/app/generated/prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { useRouter } from "next/navigation";

type CalendarCell = {
  date: Date | null;
  dayNumber?: number;
  data?: DailyFinance;
};

type Props = {
  year: number;
  month: number; // 1 - 12
  days: DailyFinance[];
  isLoading: boolean;
};

// yyyy-mm-dd
function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeDays(days: DailyFinance[]) {
  const map = new Map<string, DailyFinance>();

  days.forEach((d) => {
    const key = toDateKey(new Date(d.date));
    map.set(key, d);
  });

  return map;
}

function buildCalendar(
  year: number,
  month: number,
  dayMap: Map<string, DailyFinance>,
): CalendarCell[] {
  const cells: CalendarCell[] = [];

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  // JS: CN = 0 → chuyển CN về cuối
  const startWeekday = (firstDay.getDay() + 6) % 7;

  // padding đầu tháng
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: null });
  }

  // ngày trong tháng
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const key = toDateKey(date);

    cells.push({
      date,
      dayNumber: d,
      data: dayMap.get(key),
    });
  }

  return cells;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function BlockDate({ year, month, days, isLoading }: Props) {
  const router = useRouter();
  const dayMap = normalizeDays(days);
  const cells = buildCalendar(year, month, dayMap);
  const todayKey = dateKey(new Date());

  return (
    <div className="rounded-[40px] bg-white p-4 shadow-sm">
      {/* Weekday header */}
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-xs text-green-4 uppercase font-bold">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={i} />;
          }

          const profit = Number(cell.data?.totalProfit || 0);
          const isPositive = profit > 0;
          const isNegative = profit < 0;

          const cellDateKey = dateKey(cell.date);
          const isFutureDay = cellDateKey > todayKey;

          if (isLoading) {
            return <Skeleton key={i} className="h-11 w-full rounded-[5px]" />;
          }

          return (
            <div
              key={i}
              onClick={() => {
                if (isFutureDay) return;
                if (cell?.data?.id)
                  router.push(`/daily-detail/${cell?.data?.id}`);
              }}
              className={`
                rounded-[5px] p-2 text-center text-xs transition cursor-pointer
                ${
                  isFutureDay
                    ? "opacity-50 cursor-not-allowed!"
                    : isPositive
                      ? "bg-green-3"
                      : isNegative
                        ? "bg-white-2"
                        : "bg-slate-50"
                }
              `}
            >
              {/* Day number */}
              <p
                className={`text-xs font-bold ${
                  isPositive
                    ? "text-green-1"
                    : isNegative
                      ? "text-red-2"
                      : "text-green-1"
                }`}
              >
                {cell.dayNumber}
              </p>

              {/* Profit */}
              <p
                className={`text-11px font-extrabold ${
                  isPositive
                    ? "text-green-2"
                    : isNegative
                      ? "text-red-1"
                      : "text-green-1"
                }`}
              >
                {formatCompactNumber(profit)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
