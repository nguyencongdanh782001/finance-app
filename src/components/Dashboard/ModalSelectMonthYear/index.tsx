"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { financeAPI } from "@/endpoint/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";

interface ModalSelectMonthYearProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
  initialMonth: number;
  ChangeMonthYear(year: number, month: number): void;
}

const UNPAID_MONTHS_CACHE_TTL = 60_000;
const unpaidMonthsCache = new Map<
  number,
  { months: number[]; cachedAt: number }
>();
const unpaidMonthsRequests = new Map<number, Promise<number[]>>();

const getUnpaidMonths = (year: number) => {
  const cached = unpaidMonthsCache.get(year);
  if (cached && Date.now() - cached.cachedAt < UNPAID_MONTHS_CACHE_TTL) {
    return Promise.resolve(cached.months);
  }

  const pending = unpaidMonthsRequests.get(year);
  if (pending) return pending;

  const request = financeAPI
    .getUnpaidMonths(year)
    .then((response) =>
      response.code === RESPONSE_CODES.success
        ? response.data?.months || []
        : [],
    )
    .catch(() => [])
    .then((months) => {
      unpaidMonthsCache.set(year, { months, cachedAt: Date.now() });
      return months;
    })
    .finally(() => unpaidMonthsRequests.delete(year));

  unpaidMonthsRequests.set(year, request);
  return request;
};

const ModalSelectMonthYear = (props: ModalSelectMonthYearProps) => {
  const { open, onClose, initialYear, initialMonth, ChangeMonthYear } = props;
  const router = useRouter();

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [unpaidMonths, setUnpaidMonths] = useState<number[]>([]);
  const [loadingUnpaidMonths, setLoadingUnpaidMonths] = useState(false);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const cached = unpaidMonthsCache.get(year);
    const hasFreshCache =
      cached && Date.now() - cached.cachedAt < UNPAID_MONTHS_CACHE_TTL;

    setLoadingUnpaidMonths(!hasFreshCache);
    void getUnpaidMonths(year).then((months) => {
      if (!active) return;
      setUnpaidMonths(months);
      setLoadingUnpaidMonths(false);
    });

    return () => {
      active = false;
    };
  }, [open, year]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const isCurrentYear = year === currentYear;

  function handleConfirm() {
    ChangeMonthYear(year, month);
    router.push(`/admin?year=${year}&month=${month}`);
    onClose();
  }
  function isMonthDisabled(m: number) {
    return year === currentYear && m > currentMonth;
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center gap-4! h-fit max-w-89 bg-white rounded-[10px] px-6! py-7.5! overflow-y-auto">
        <DialogHeader className="flex flex-col justify-center items-center gap-4!">
          <DialogTitle className="uppercase text-13px text-gray-3 font-bold text-center">
            CHỌN THÁNG THỐNG KÊ
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {/* Year */}
        <div className="mb-4 flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            className="text-green-6"
            onClick={() => {
              const newYear = year - 1;
              setYear(newYear);
              setMonth(newYear === currentYear ? currentMonth : 1);
            }}
          >
            <ChevronLeft className="size-5!" />
          </Button>

          <span className="flex items-center gap-2 text-lg font-semibold">
            {year}
            {loadingUnpaidMonths ? (
              <LoaderCircle
                className="size-4 animate-spin text-green-6"
                aria-label="Đang tải trạng thái thanh toán"
              />
            ) : null}
          </span>

          <Button
            variant="ghost"
            className="text-green-6 disabled:cursor-not-allowed!"
            disabled={isCurrentYear}
            onClick={() => {
              const newYear = year + 1;
              setYear(newYear);
              setMonth(newYear === currentYear ? currentMonth : 1);
            }}
          >
            <ChevronRight className="size-5!" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="w-full grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => {
            const m = i + 1;
            const active = m === month;
            const disabled = isMonthDisabled(m);

            return (
              <Button
                variant="ghost"
                key={m}
                disabled={disabled}
                onClick={() => setMonth(m)}
                className={`relative flex flex-col rounded-2xl border ${currentYear === year && currentMonth === m ? "border-blue-5" : "border-gray-1"}  p-3 transition h-23.5 text-center text-green-1 uppercase font-bold cursor-pointer disabled:cursor-not-allowed!
        ${
          disabled
            ? "cursor-not-allowed! opacity-50"
            : active
              ? "border-green-6 bg-green-8 text-green-7 hover:bg-green-8!"
              : ""
        }
      `}
              >
                <div className="flex w-full items-center justify-center text-10px">
                  <span>THÁNG</span>
                  {unpaidMonths.includes(m) ? (
                    <span
                      className="absolute right-2 top-2 size-2 rounded-full bg-amber-500"
                      title="Có đơn chưa thanh toán"
                      aria-label="Có đơn chưa thanh toán"
                    />
                  ) : null}
                </div>
                <div
                  className={`text-md ${active ? "text-green-7" : "text-gray-3"}`}
                >
                  {m}
                </div>
              </Button>
            );
          })}
        </div>
        <DialogFooter className="mt-4 w-full flex flex-col justify-center items-center gap-4.5">
          <Button
            type="button"
            className="h-13.75! w-full bg-green-2 text-sm font-semibold hover:bg-green-2 hover:opacity-90 uppercase"
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSelectMonthYear;
