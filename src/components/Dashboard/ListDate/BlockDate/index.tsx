"use client";

import type { DailyFinance } from "@/app/generated/prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/helper/formatCompactNumber";
import { useRouter } from "next/navigation";

// ================== TYPES ==================
type CalendarCell = {
  date: Date | null;
  dayNumber?: number;
  data?: DailyDay;
};

type DailyDay = DailyFinance & { hasUnpaidOrders: boolean };

type Props = {
  year: number;
  month: number; // 1 - 12
  days: DailyDay[];
  isLoading: boolean;
};

// ================== DATE UTILS (LOCAL-SAFE) ==================
// ❌ Không dùng toISOString (UTC) → gây lệch ngày
function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ================== NORMALIZE DATA ==================
function normalizeDays(days: DailyDay[]) {
  const map = new Map<string, DailyDay>();

  days.forEach((d) => {
    const key = toLocalDateKey(new Date(d.date));
    map.set(key, d);
  });

  return map;
}

// ================== BUILD CALENDAR ==================
function buildCalendar(
  year: number,
  month: number,
  dayMap: Map<string, DailyDay>,
): CalendarCell[] {
  const cells: CalendarCell[] = [];

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  // JS: CN = 0 → chuyển CN về cuối (T2 → CN)
  const startWeekday = (firstDay.getDay() + 6) % 7;

  // Padding đầu tháng
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: null });
  }

  // Ngày trong tháng
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const key = toLocalDateKey(date);

    cells.push({
      date,
      dayNumber: d,
      data: dayMap.get(key),
    });
  }

  return cells;
}

// ================== COMPONENT ==================
export default function BlockDate({ year, month, days, isLoading }: Props) {
  const router = useRouter();

  const dayMap = normalizeDays(days);
  const cells = buildCalendar(year, month, dayMap);
  const todayKey = toLocalDateKey(new Date());

  return (
    <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      {/* Weekday header */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;

          if (isLoading) {
            return <Skeleton key={i} className="h-11 w-full rounded-[5px]" />;
          }

          const profit = Number(cell.data?.totalProfit || 0);
          const isPositive = profit > 0;
          const isNegative = profit < 0;

          const cellDateKey = toLocalDateKey(cell.date);
          const isFutureDay = cellDateKey > todayKey;
          const isCurrentDay = cellDateKey === todayKey;
          return (
            <div
              key={i}
              onClick={() => {
                // if (isFutureDay) return;
                if (cell.data?.id) {
                  router.push(`/admin/daily-detail/${cell.data.id}`);
                }
              }}
              className={
                "relative min-w-0 rounded-md p-1.5 text-center text-xs transition sm:p-2 " +
                "cursor-pointer" +
                // (isFutureDay
                //   ? "opacity-50 cursor-not-allowed"
                //   : "cursor-pointer")
                (isPositive
                  ? " bg-emerald-50"
                  : isNegative
                    ? " bg-white-2"
                    : " bg-slate-50")
              }
            >
              {isCurrentDay && (
                <div className="absolute size-2 rounded-full bg-blue-5 -right-0.5 -top-0.5" />
              )}
              {cell.data?.hasUnpaidOrders && (
                <span
                  className="absolute left-1 top-1 size-1.5 rounded-full bg-amber-500"
                  title="Có đơn chưa thanh toán"
                  aria-label="Có đơn chưa thanh toán"
                />
              )}

              {/* Day number */}
              <p
                className={
                  "text-10px font-bold " +
                  (isPositive
                    ? "text-green-1"
                    : isNegative
                      ? "text-red-500"
                      : "text-slate-400")
                }
              >
                {cell.dayNumber}
              </p>

              {/* Profit */}
              <p
                className={
                  "text-10px font-extrabold " +
                  (isPositive
                    ? "text-emerald-700"
                    : isNegative
                      ? "text-red-1"
                      : "text-slate-400")
                }
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
