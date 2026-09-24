"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CUSTOMER_ORDER_FILTERS,
  ORDER_STATUS_CONFIG,
} from "@/lib/orders/order-status";
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
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
};

const selectClass =
  "h-10 min-w-0 rounded-lg border border-(--admin-border) bg-white px-3 text-sm font-medium text-(--admin-text-secondary) outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
const inputClass =
  "h-10 min-w-0 rounded-lg border border-(--admin-border) bg-white px-3 text-sm text-(--admin-text) outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

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

function OrderStatusBadge({ status }: { status: OrderStatusValue }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold",
        config.tone === "success" && "bg-emerald-50 text-emerald-700",
        config.tone === "danger" && "bg-rose-50 text-rose-700",
        config.tone === "pending" && "bg-amber-50 text-amber-700",
        config.tone === "info" && "bg-sky-50 text-sky-700",
        config.tone === "active" && "bg-violet-50 text-violet-700",
        config.tone === "muted" && "bg-slate-100 text-slate-600",
      )}
    >
      {config.shortLabel}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatusValue }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "PAID"
          ? "bg-emerald-50 text-emerald-700"
          : status === "FAILED" ||
              status === "REFUNDED" ||
              status === "CANCELLED"
            ? "bg-rose-50 text-rose-700"
            : "bg-slate-100 text-slate-600",
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function AdminOnlineOrdersPage() {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [delivery, setDelivery] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

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
      if (showLoading) setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/orders?${query}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload.message || "Không thể tải danh sách đơn hàng.",
          );
        setData(payload);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Không thể tải danh sách đơn hàng.",
        );
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const refresh = () => void load(false);
    window.addEventListener("admin-order-notification", refresh);
    return () =>
      window.removeEventListener("admin-order-notification", refresh);
  }, [load]);

  const reset = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("ALL");
    setPaymentStatus("ALL");
    setPaymentMethod("ALL");
    setDelivery("ALL");
    setFrom("");
    setTo("");
    setSort("newest");
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
              {countByStatus[item.value]}
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
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className={selectClass}
              aria-label="Trạng thái thanh toán"
            >
              <option value="ALL">Mọi thanh toán</option>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className={selectClass}
              aria-label="Phương thức thanh toán"
            >
              <option value="ALL">Mọi phương thức</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={selectClass}
              aria-label="Sắp xếp"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="total-desc">Giá trị cao nhất</option>
              <option value="total-asc">Giá trị thấp nhất</option>
            </select>
            <select
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
              className={selectClass}
              aria-label="Tình trạng vận đơn"
            >
              <option value="ALL">Mọi vận đơn</option>
              <option value="WITH_SHIPMENT">Đã có vận đơn</option>
              <option value="WITHOUT_SHIPMENT">Chưa có vận đơn</option>
            </select>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[180px_180px_auto]">
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
              aria-label="Từ ngày"
            />
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
              aria-label="Đến ngày"
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
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-(--admin-background-subtle) text-xs font-semibold text-(--admin-text-muted)">
                  <tr>
                    <th className="px-4 py-3">Đơn hàng</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thanh toán</th>
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
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PaymentBadge status={order.paymentStatus} />
                        <p className="mt-1 text-xs text-(--admin-text-muted)">
                          {order.paymentMethod
                            ? PAYMENT_METHOD_LABELS[order.paymentMethod]
                            : "Chưa chọn"}
                        </p>
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
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="rounded-xl border border-(--admin-border) bg-white p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-(--admin-text)">
                        {order.orderNumber}
                      </p>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                </Link>
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
