"use client";

import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { SoldProductGroupRow } from "@/components/DailyDetail/SoldProductGroup";
import { updateExpandedGroupKeys } from "@/components/DailyDetail/sold-product-expanded-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import type {
  DailyDetailResponse,
  DailySoldProductGroupListResponse,
  SoldProductSourceValue,
} from "@/interface/financeAPI";
import type { FieldInputProps, FieldMetaProps, FormikProps } from "formik";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface FormProductsProps {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  reload: boolean;
  onReload: () => void;
}

type SourceFilter = "ALL" | SoldProductSourceValue;
type SelectOption = { value: string; label: string; disabled?: boolean };
type RuntimeSelectProps = {
  field: FieldInputProps<string>;
  form: FormikProps<Record<string, string>>;
  meta: FieldMetaProps<string>;
  optionValue: SelectOption[];
  placeholder: string;
  searchable?: boolean;
  className?: string;
  inputClassName?: string;
  lblClassName?: string;
  popoverTrgVariant?: { variant?: string };
  onManualSelect?: (value?: string) => void;
};

const RuntimeCustomSelect =
  CustomSelect as unknown as ComponentType<RuntimeSelectProps>;

const SOURCE_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "Tất cả nguồn" },
  { value: "OFFLINE", label: "Tại shop" },
  { value: "ONLINE", label: "Online" },
  { value: "LEGACY_MANUAL", label: "Dữ liệu cũ" },
];

const EMPTY_RESPONSE: DailySoldProductGroupListResponse = {
  items: [],
  summary: {
    totalGroups: 0,
    totalQuantity: 0,
    totalAmount: 0,
    totalProfit: null,
    pendingQuantity: 0,
    pendingAmount: 0,
  },
  pagination: { page: 1, limit: 10, totalGroups: 0, totalPages: 1 },
};

const formatMoney = (value: number) => `${formatCurrencyVND(value)}đ`;

function SourceSelect({
  value,
  onChange,
}: {
  value: SourceFilter;
  onChange: (value: SourceFilter) => void;
}) {
  const form = useMemo(
    () =>
      ({
        errors: {},
        touched: {},
        setFieldValue: () => Promise.resolve(),
      }) as unknown as FormikProps<Record<string, string>>,
    [],
  );

  return (
    <RuntimeCustomSelect
      field={
        {
          name: "soldProductSource",
          value,
          onChange: () => undefined,
          onBlur: () => undefined,
        } as FieldInputProps<string>
      }
      form={form}
      meta={{} as FieldMetaProps<string>}
      optionValue={SOURCE_OPTIONS}
      placeholder="Tất cả nguồn"
      searchable={false}
      className="w-full! min-w-0! sm:w-full!"
      inputClassName="h-11! w-full! min-w-0! rounded-2xl! border-slate-100! bg-slate-50! px-3! text-sm!"
      lblClassName="text-sm font-bold"
      onManualSelect={(nextValue) => onChange(nextValue as SourceFilter)}
    />
  );
}

export default function FormProducts({
  data,
  isLoading,
  reload,
}: FormProductsProps) {
  const dailyId = data?.id;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [source, setSource] = useState<SourceFilter>("ALL");
  const [page, setPage] = useState(1);
  const [result, setResult] =
    useState<DailySoldProductGroupListResponse | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setSearch("");
    setDebouncedSearch("");
    setSource("ALL");
    setPage(1);
    setResult(null);
    setExpandedGroups(new Set());
  }, [dailyId]);

  useEffect(() => {
    if (!dailyId || isLoading) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    setError("");

    void financeAPI
      .getDailySoldProductGroups(dailyId, {
        search: debouncedSearch || undefined,
        source,
        page,
        limit: 10,
      })
      .then((response) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response.code !== RESPONSE_CODES.success || !response.data) {
          setError("Không thể tải danh sách sản phẩm đã bán.");
          return;
        }

        setResult(response.data);
        if (response.data.pagination.page !== page) {
          setPage(response.data.pagination.page);
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsFetching(false);
        }
      });
  }, [dailyId, debouncedSearch, source, page, reload, isLoading, retryCount]);

  const currentResult = result ?? EMPTY_RESPONSE;
  const hasFilters = Boolean(search || source !== "ALL");
  const showInitialLoading = isLoading || (!result && isFetching);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSource("ALL");
    setPage(1);
  };

  const changeSource = (nextSource: SourceFilter) => {
    setSource(nextSource);
    setPage(1);
  };

  const toggleGroup = (groupKey: string, open: boolean) => {
    setExpandedGroups((current) =>
      updateExpandedGroupKeys(current, groupKey, open),
    );
  };

  return (
    <section className="w-full max-w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-full bg-blue-50 p-2.5">
            <PackageCheck className="size-4 text-blue-2" />
          </div>
          <div className="min-w-0">
            <p className="text-13px font-bold uppercase text-gray-3">
              Sản phẩm đã bán
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Tổng hợp tự động từ các đơn hàng hợp lệ.
            </p>
          </div>
          {isFetching && result ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-blue-2" />
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-90 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-10px font-bold uppercase text-slate-400">
              Số lượng
            </p>
            <p className="text-base font-extrabold text-slate-800">
              {currentResult.summary.totalQuantity.toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="rounded-xl bg-green-50 px-3 py-2">
            <p className="text-10px font-bold uppercase text-green-2">
              Doanh thu
            </p>
            <p className="truncate text-base font-extrabold text-green-2">
              {formatMoney(currentResult.summary.totalAmount)}
            </p>
          </div>
          <div className="col-span-2 rounded-xl bg-emerald-50 px-3 py-2 sm:col-span-1">
            <p className="text-10px font-bold uppercase text-emerald-600">
              Lợi nhuận
            </p>
            <p
              className={`truncate text-base font-extrabold ${
                (currentResult.summary.totalProfit ?? 0) < 0
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              {currentResult.summary.totalProfit === null
                ? "-"
                : formatMoney(currentResult.summary.totalProfit)}
            </p>
          </div>
        </div>
      </div>
      {currentResult.summary.pendingQuantity > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Chờ thanh toán:{" "}
          {currentResult.summary.pendingQuantity.toLocaleString("vi-VN")} sản
          phẩm · {formatMoney(currentResult.summary.pendingAmount)}
        </div>
      ) : null}

      <div className="mt-5 grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm sản phẩm, phân loại, SKU hoặc mã đơn"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-slate-400 hover:bg-slate-100"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <div className="min-w-0">
          <SourceSelect value={source} onChange={changeSource} />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-11 justify-center rounded-2xl px-3 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed sm:justify-start"
          onClick={resetFilters}
          disabled={!hasFilters}
        >
          <RotateCcw className="size-4" />
          Xóa lọc
        </Button>
      </div>

      {showInitialLoading ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
            >
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5 rounded-md" />
                <Skeleton className="h-3 w-3/5 rounded-md" />
              </div>
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
          ))}
        </div>
      ) : error && !result ? (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">{error}</p>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 text-red-700 hover:bg-red-100"
            onClick={() => setRetryCount((current) => current + 1)}
          >
            Thử lại
          </Button>
        </div>
      ) : currentResult.items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <ReceiptText className="mx-auto size-9 text-slate-300" />
          <p className="mt-3 text-base font-extrabold text-slate-600">
            {hasFilters
              ? "Không tìm thấy sản phẩm phù hợp"
              : "Chưa có sản phẩm nào được bán trong ngày này"}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {hasFilters
              ? "Hãy thử từ khóa hoặc nguồn bán khác."
              : "Sản phẩm sẽ xuất hiện khi có đơn tại shop hoặc đơn online đã giao và đã thanh toán."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 hidden grid-cols-[minmax(0,1fr)_72px_112px_28px] gap-3 px-4 pb-2 text-10px font-extrabold uppercase text-slate-400 sm:grid lg:grid-cols-[minmax(0,1.5fr)_64px_66px_118px_100px_100px_28px]">
            <span>Sản phẩm</span>
            <span className="text-right">Số lượng</span>
            <span className="hidden text-right lg:block">Lượt bán</span>
            <span className="hidden text-right lg:block">Giá bán</span>
            <span className="text-right">Thành tiền</span>
            <span className="hidden text-right lg:block">Lợi nhuận</span>
            <span aria-hidden="true" />
          </div>
          <div className="grid min-w-0 gap-2">
            {currentResult.items.map((group) => (
              <SoldProductGroupRow
                key={group.groupKey}
                group={group}
                open={expandedGroups.has(group.groupKey)}
                onOpenChange={(open) => toggleGroup(group.groupKey, open)}
              />
            ))}
          </div>
        </>
      )}

      {currentResult.pagination.totalPages > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Trang {currentResult.pagination.page}/
            {currentResult.pagination.totalPages} ·{" "}
            {currentResult.pagination.totalGroups.toLocaleString("vi-VN")} sản
            phẩm
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              aria-label="Trang sản phẩm trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50"
              disabled={
                page >= currentResult.pagination.totalPages || isFetching
              }
              onClick={() => setPage((current) => current + 1)}
              aria-label="Trang sản phẩm tiếp theo"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
