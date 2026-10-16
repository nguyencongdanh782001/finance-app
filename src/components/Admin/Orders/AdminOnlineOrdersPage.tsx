"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { AdminSelect } from "@/components/Admin/AdminFields";
import { AuthDatePicker } from "@/components/Auth/AuthPageClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  canManuallyMarkOrderPaid,
  CUSTOMER_ORDER_FILTERS,
  ONLINE_STATUS_FLOW,
  ORDER_STATUS_CONFIG,
} from "@/lib/orders/order-status";
import { toast } from "@/hook/use-toast";
import type {
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/interface/financeAPI";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hook/use-debounced-value";

type OrderListItem = {
  id: number;
  orderNumber: string;
  status: OrderStatusValue;
  paymentStatus: PaymentStatusValue;
  paymentMethod: PaymentMethodValue | null;
  totalAmount: number;
  placedAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  itemCount: number;
  items: Array<{ productTitle: string; quantity: number }>;
};

type OrderListResponse = {
  items: OrderListItem[];
  counts: Record<
    | "all"
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipping"
    | "delivered"
    | "cancelled",
    number
  >;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PROCESSING: "Đang xử lý",
  AUTHORIZED: "Đã xác thực",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  CASH: "Tiền mặt",
  COD: "COD",
  CARD: "Thẻ",
  BANK_TRANSFER: "Chuyển khoản",
  ZALOPAY: "ZaloPay",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
};

const DATE_PICKER_CLASS =
  "h-10! w-full! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! font-medium! shadow-none! hover:border-(--admin-primary)!";

const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "total-desc", label: "Giá trị cao nhất" },
  { value: "total-asc", label: "Giá trị thấp nhất" },
];
const DELIVERY_OPTIONS = [
  { value: "ALL", label: "Mọi vận đơn" },
  { value: "WITH_SHIPMENT", label: "Đã có vận đơn" },
  { value: "WITHOUT_SHIPMENT", label: "Chưa có vận đơn" },
];

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
const formatDate = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getOrderStatusOptions = (order: OrderListItem) => {
  const nextStatus = ONLINE_STATUS_FLOW[order.status] as
    OrderStatusValue | undefined;
  return [order.status, ...(nextStatus ? [nextStatus] : [])].map((value) => ({
    value,
    label: ORDER_STATUS_CONFIG[value].shortLabel,
  }));
};

const getPaymentStatusOptions = (order: OrderListItem) => {
  const values: PaymentStatusValue[] = [order.paymentStatus];
  if (
    canManuallyMarkOrderPaid(order.status, order.paymentStatus) &&
    order.paymentStatus !== "PAID"
  ) {
    values.push("PAID");
  }
  return values.map((value) => ({
    value,
    label: PAYMENT_STATUS_LABELS[value],
  }));
};

function LoadingRows() {
  return (
    <>
      <div className="hidden lg:block">
        <div className="grid grid-cols-[1.25fr_0.95fr_1fr_0.72fr_0.78fr_0.55fr_0.62fr_64px] gap-4 border-b border-(--admin-border) bg-(--admin-background-subtle) px-4 py-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-3 w-16 rounded" />
          ))}
        </div>
        <div className="divide-y divide-(--admin-border)">
          {Array.from({ length: 6 }, (_, row) => (
            <div
              key={row}
              className="grid grid-cols-[1.25fr_0.95fr_1fr_0.72fr_0.78fr_0.55fr_0.62fr_64px] items-center gap-4 px-4 py-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-(--admin-border) bg-white p-4"
          >
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminOnlineOrdersPage() {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [delivery, setDelivery] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(
    () => setPage(1),
    [
      debouncedSearch,
      status,
      paymentStatus,
      paymentMethod,
      delivery,
      from,
      to,
      sort,
    ],
  );

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sort,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status !== "ALL") params.set("status", status);
    if (paymentStatus !== "ALL") params.set("paymentStatus", paymentStatus);
    if (paymentMethod !== "ALL") params.set("paymentMethod", paymentMethod);
    if (delivery !== "ALL") params.set("delivery", delivery);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [
    debouncedSearch,
    delivery,
    from,
    page,
    paymentMethod,
    paymentStatus,
    sort,
    status,
    to,
  ]);

  const load = useCallback(
    async (showLoading = true) => {
      const requestId = ++requestIdRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (showLoading) setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/orders?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload.message || "Không thể tải danh sách đơn hàng.",
          );
        if (requestId === requestIdRef.current) setData(payload);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        if (requestId !== requestIdRef.current) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Không thể tải danh sách đơn hàng.",
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    },
    [query],
  );

  useEffect(() => {
    void load(data === null);
  }, [load]);
  useEffect(() => {
    const refresh = () => void load(false);
    window.addEventListener("admin-order-notification", refresh);
    return () =>
      window.removeEventListener("admin-order-notification", refresh);
  }, [load]);

  const reset = () => {
    setSearch("");
    setStatus("ALL");
    setPaymentStatus("ALL");
    setPaymentMethod("ALL");
    setDelivery("ALL");
    setFrom("");
    setTo("");
    setSort("newest");
  };

  const updateOrder = async (
    order: OrderListItem,
    field: "status" | "paymentStatus",
    value: string,
  ) => {
    if (
      (field === "status" && value === order.status) ||
      (field === "paymentStatus" && value === order.paymentStatus)
    ) {
      return;
    }

    setUpdatingOrderId(order.id);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          field === "status" ? { status: value } : { action: "mark_paid" },
        ),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Không thể cập nhật đơn hàng.");
      }
      toast({
        title:
          field === "status"
            ? "Đã cập nhật trạng thái đơn"
            : "Đã xác nhận thanh toán",
        className: "bg-green-16 text-white",
      });
      await load(false);
    } catch (cause) {
      toast({
        title:
          cause instanceof Error
            ? cause.message
            : "Không thể cập nhật đơn hàng.",
        className: "bg-red-1 text-white",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const countByStatus: Record<string, number> = {
    ALL: data?.counts.all || 0,
    PENDING: data?.counts.pending || 0,
    CONFIRMED: data?.counts.confirmed || 0,
    PREPARING: data?.counts.preparing || 0,
    SHIPPING: data?.counts.shipping || 0,
    DELIVERED: data?.counts.delivered || 0,
    CANCELLED: data?.counts.cancelled || 0,
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Đơn hàng online"
        description="Theo dõi, xác nhận và xử lý đơn hàng từ website trên tất cả các ngày."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {CUSTOMER_ORDER_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={cn(
              "rounded-xl border bg-white p-3 text-left transition-colors",
              status === item.value
                ? "border-primary ring-2 ring-primary/10"
                : "border-(--admin-border) hover:border-primary/40",
            )}
          >
            <span className="block text-xs font-medium text-(--admin-text-muted)">
              {item.label}
            </span>
            <span className="mt-1 block text-xl font-bold text-(--admin-text)">
              {loading && !data ? (
                <Skeleton className="h-6 w-full rounded" />
              ) : (
                countByStatus[item.value]
              )}
            </span>
          </button>
        ))}
      </div>

      <AdminSection className="p-0! sm:p-0!">
        <div className="border-b border-(--admin-border) p-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(4,minmax(140px,0.7fr))]">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-(--admin-border) bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <Search className="size-4 shrink-0 text-(--admin-text-muted)" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Mã đơn, tên hoặc số điện thoại"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-(--admin-text-muted)"
              />
            </label>
            <AdminSelect
              name="paymentStatusFilter"
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={[
                { value: "ALL", label: "Mọi thanh toán" },
                ...PAYMENT_STATUS_OPTIONS,
              ]}
              placeholder="Trạng thái thanh toán"
            />
            <AdminSelect
              name="paymentMethodFilter"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { value: "ALL", label: "Mọi phương thức" },
                ...PAYMENT_METHOD_OPTIONS,
              ]}
              placeholder="Phương thức thanh toán"
            />
            <AdminSelect
              name="sort"
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              placeholder="Sắp xếp"
            />
            <AdminSelect
              name="deliveryFilter"
              value={delivery}
              onChange={setDelivery}
              options={DELIVERY_OPTIONS}
              placeholder="Tình trạng vận đơn"
            />
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[180px_180px_auto]">
            <AuthDatePicker
              value={from}
              allowFuture
              clearable
              onClear={() => setFrom("")}
              onChange={setFrom}
              className={DATE_PICKER_CLASS}
              placeholder="Từ ngày"
            />
            <AuthDatePicker
              value={to}
              allowFuture
              clearable
              minDate={from || undefined}
              onClear={() => setTo("")}
              onChange={setTo}
              className={DATE_PICKER_CLASS}
              placeholder="Đến ngày"
            />
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-fit text-(--admin-text-secondary)"
              onClick={reset}
            >
              <RotateCcw className="size-4" /> Xóa bộ lọc
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingRows />
        ) : error ? (
          <div className="p-8 text-center text-sm text-rose-600">{error}</div>
        ) : !data?.items.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-(--admin-primary-soft) text-primary">
              <PackageSearch className="size-6" />
            </span>
            <p className="mt-3 font-semibold text-(--admin-text)">
              Không tìm thấy đơn hàng
            </p>
            <p className="mt-1 text-sm text-(--admin-text-muted)">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1240px] text-left">
                <thead className="bg-(--admin-background-subtle) text-xs font-semibold text-(--admin-text-muted)">
                  <tr>
                    <th className="px-4 py-3">Đơn hàng</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thanh toán</th>
                    <th className="px-4 py-3">Hình thức</th>
                    <th className="px-4 py-3 text-right">Tổng tiền</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--admin-border)">
                  {data.items.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-(--admin-background-subtle)"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-(--admin-text) hover:text-primary"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-1 text-xs text-(--admin-text-muted)">
                          {formatDate(order.placedAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-44 truncate text-sm font-medium text-(--admin-text)">
                          {order.customerName}
                        </p>
                        <p className="mt-1 text-xs text-(--admin-text-muted)">
                          {order.customerPhone || order.customerEmail || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-52 truncate text-sm text-(--admin-text-secondary)">
                          {order.items[0]?.productTitle || "Đơn hàng"}
                        </p>
                        <p className="mt-1 text-xs text-(--admin-text-muted)">
                          {order.itemCount} sản phẩm
                        </p>
                      </td>
                      <td className="w-44 px-4 py-3">
                        <div className="relative">
                          <AdminSelect
                            name={`orderStatus-${order.id}`}
                            value={order.status}
                            options={getOrderStatusOptions(order)}
                            placeholder="Trạng thái đơn"
                            disabled={
                              updatingOrderId === order.id ||
                              getOrderStatusOptions(order).length === 1
                            }
                            onChange={(value) =>
                              void updateOrder(order, "status", value)
                            }
                          />
                          {updatingOrderId === order.id ? (
                            <Loader2 className="absolute right-9 top-3 size-4 animate-spin text-primary" />
                          ) : null}
                        </div>
                      </td>
                      <td className="w-48 px-4 py-3">
                        <AdminSelect
                          name={`paymentStatus-${order.id}`}
                          value={order.paymentStatus}
                          options={getPaymentStatusOptions(order)}
                          placeholder="Thanh toán"
                          disabled={
                            updatingOrderId === order.id ||
                            getPaymentStatusOptions(order).length === 1
                          }
                          onChange={(value) =>
                            void updateOrder(order, "paymentStatus", value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-(--admin-text-secondary)">
                        {order.paymentMethod
                          ? PAYMENT_METHOD_LABELS[order.paymentMethod]
                          : "Chưa chọn"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-(--admin-text)">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/orders/${order.id}`}>
                            Chi tiết
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 lg:hidden">
              {data.items.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl border border-(--admin-border) bg-white p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block truncate font-semibold text-(--admin-text) hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-1 text-xs text-(--admin-text-muted)">
                        {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-(--admin-text)">
                      {formatMoney(order.totalAmount)}
                    </p>
                  </div>
                  <div className="mt-3">
                    <p className="truncate text-sm font-medium text-(--admin-text-secondary)">
                      {order.customerName}
                    </p>
                    <p className="mt-1 text-xs text-(--admin-text-muted)">
                      {order.customerPhone ||
                        order.customerEmail ||
                        "Không có liên hệ"}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <AdminSelect
                      name={`mobileOrderStatus-${order.id}`}
                      value={order.status}
                      options={getOrderStatusOptions(order)}
                      placeholder="Trạng thái đơn"
                      disabled={
                        updatingOrderId === order.id ||
                        getOrderStatusOptions(order).length === 1
                      }
                      onChange={(value) =>
                        void updateOrder(order, "status", value)
                      }
                    />
                    <AdminSelect
                      name={`mobilePaymentStatus-${order.id}`}
                      value={order.paymentStatus}
                      options={getPaymentStatusOptions(order)}
                      placeholder="Thanh toán"
                      disabled={
                        updatingOrderId === order.id ||
                        getPaymentStatusOptions(order).length === 1
                      }
                      onChange={(value) =>
                        void updateOrder(order, "paymentStatus", value)
                      }
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-(--admin-border) pt-3">
                    <span className="text-xs text-(--admin-text-muted)">
                      Hình thức:{" "}
                      <span className="font-semibold text-(--admin-text-secondary)">
                        {order.paymentMethod
                          ? PAYMENT_METHOD_LABELS[order.paymentMethod]
                          : "Chưa chọn"}
                      </span>
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>Chi tiết</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {data && data.pagination.total > 0 ? (
          <div className="flex items-center justify-between border-t border-(--admin-border) px-4 py-3">
            <p className="text-xs text-(--admin-text-muted)">
              Trang {data.pagination.page}/{data.pagination.totalPages} ·{" "}
              {data.pagination.total} đơn
            </p>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((value) => value + 1)}
                aria-label="Trang sau"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </AdminSection>
    </AdminPageContainer>
  );
}
