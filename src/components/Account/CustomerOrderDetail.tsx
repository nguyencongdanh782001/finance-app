"use client";
/* eslint-disable @next/next/no-img-element */

import {
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { OrderStatus } from "@/app/generated/prisma/client";
import {
  CUSTOMER_ORDER_TIMELINE,
  ORDER_STATUS_CONFIG,
  getCustomerTimelineStep,
} from "@/lib/orders/order-status";
import OnlinePaymentPanel from "@/components/Storefront/OnlinePaymentPanel";

type OrderItem = {
  id: number;
  title: string;
  imageUrl: string | null;
  color: string | null;
  size: string | null;
  sku: string | null;
  quantity: number;
  originalUnitPrice: number;
  unitPrice: number;
  totalPrice: number;
};

type OrderDetail = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  placedAt: string;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  paidAt: string | null;
  note: string | null;
  receiver: { name: string | null; phone: string | null; address: string };
  shipping: {
    estimatedMinutes: number | null;
    distanceKm: number | null;
    carrier: string | null;
    trackingNumber: string | null;
    status: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  };
  discount: {
    total: number;
    couponCode: string | null;
  };
  items: OrderItem[];
  payments: Array<{
    id: number;
    method: string;
    status: string;
    amount: number;
    transactionId: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  history: Array<{
    id: number;
    previousStatus: OrderStatus | null;
    status: OrderStatus;
    publicNote: string | null;
    createdAt: string;
  }>;
};

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const dateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const paymentMethodLabels: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CARD: "Thẻ ngân hàng",
  ZALOPAY: "ZaloPay",
  PAYPAL: "PayPal",
  STRIPE: "Thẻ quốc tế",
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang chờ thanh toán",
  PROCESSING: "Đang xử lý",
  AUTHORIZED: "Đã xác thực",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Thanh toán đã hủy",
  REFUNDED: "Đã hoàn tiền",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
};

const iconMap = {
  bag: ShoppingBag,
  check: Check,
  box: Box,
  truck: Truck,
  "package-check": PackageCheck,
  x: X,
} as const;

const statusBadgeClass = (status: OrderStatus) => {
  const tone = ORDER_STATUS_CONFIG[status].tone;
  return tone === "danger"
    ? "bg-red-50 text-red-700"
    : tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "active"
        ? "bg-[#FFF3E6] text-[#B45A1E]"
        : tone === "info"
          ? "bg-blue-50 text-blue-700"
          : "bg-[#FCEEF3] text-[#A43E5F]";
};

function Timeline({ order }: { order: OrderDetail }) {
  const currentStep = getCustomerTimelineStep(order.status);
  const historyByStep = useMemo(() => {
    const result = new Map<string, string>();
    order.history.forEach((entry) => {
      const key = ORDER_STATUS_CONFIG[entry.status]?.timelineKey;
      if (key) result.set(key, entry.createdAt);
    });
    if (!result.has("PENDING")) result.set("PENDING", order.placedAt);
    return result;
  }, [order.history, order.placedAt]);

  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-red-800">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <X className="size-5" />
          </span>
          <div>
            <p className="font-extrabold">{ORDER_STATUS_CONFIG[order.status].label}</p>
            <p className="mt-1 text-sm leading-6 text-red-700">
              {order.status === "CANCELLED"
                ? "Đơn hàng đã dừng xử lý và không tiếp tục giao."
                : "Khoản thanh toán của đơn hàng đã được hoàn lại."}
            </p>
            <p className="mt-2 text-xs font-semibold text-red-600">
              {dateTime(order.cancelledAt || order.history.at(-1)?.createdAt || null)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-0 md:grid-cols-5 md:gap-3">
      {CUSTOMER_ORDER_TIMELINE.map((step, index) => {
        const Icon = iconMap[step.icon];
        const completed = currentStep !== null && index < currentStep;
        const current = currentStep === index;
        const timestamp = historyByStep.get(step.key);
        return (
          <div key={step.key} className="relative flex gap-3 md:block md:text-center">
            {index < CUSTOMER_ORDER_TIMELINE.length - 1 ? (
              <span
                className={`absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px md:left-[calc(50%+1.25rem)] md:top-5 md:h-px md:w-[calc(100%-2.5rem)] ${completed ? "bg-[#D96C8A]" : "bg-[#EAE1E4]"}`}
                aria-hidden="true"
              />
            ) : null}
            <div
              className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 md:mx-auto ${completed || current ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#A99BA0]"} ${current ? "ring-4 ring-[#FCEEF3]" : ""}`}
              aria-label={current ? `Trạng thái hiện tại: ${step.label}` : undefined}
            >
              <Icon className="size-4" />
            </div>
            <div className="pb-5 md:pt-3 md:pb-0">
              <p className={`text-sm font-extrabold ${completed || current ? "text-[#2D2226]" : "text-[#9A8C92]"}`}>
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#8B7A80]">{step.description}</p>
              {timestamp ? (
                <p className="mt-1 text-[11px] font-semibold text-[#A43E5F]">
                  {dateTime(timestamp)}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#EAE1E4] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 text-[#A43E5F]">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#FCEEF3]">{icon}</span>
        <h2 className="font-extrabold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function CustomerOrderDetail({ orderId }: { orderId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backStatus = searchParams.get("status");
  const backHref = backStatus
    ? `/account/orders?view=orders&status=${encodeURIComponent(backStatus)}`
    : "/account/orders";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/me/orders/${orderId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Không thể tải đơn hàng.");
        return data as OrderDetail;
      })
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải đơn hàng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return <div className="grid gap-4"><div className="h-24 animate-pulse rounded-2xl bg-[#F1E9EB]" /><div className="h-64 animate-pulse rounded-2xl bg-[#F7EFF1]" /><div className="h-72 animate-pulse rounded-2xl bg-[#F7EFF1]" /></div>;
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-dashed border-[#EAE1E4] bg-white px-5 py-14 text-center">
        <Package className="mx-auto size-9 text-[#D96C8A]" />
        <p className="mt-4 font-extrabold">{error || "Không tìm thấy đơn hàng"}</p>
        <button type="button" onClick={() => router.push(backHref)} className="mt-4 text-sm font-extrabold text-[#A43E5F]">Quay lại đơn hàng →</button>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  return (
    <div className="grid gap-5">
      <div>
        <button type="button" onClick={() => router.push(backHref)} className="inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#6F6066] hover:text-[#A43E5F]">
          <ArrowLeft className="size-4" /> Đơn hàng của tôi
        </button>
        <div className="mt-5 flex flex-col gap-4 border-b border-[#EAE1E4] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A99BA0]">Chi tiết đơn hàng</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">#{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-[#6F6066]">Đặt lúc {dateTime(order.placedAt)}</p>
          </div>
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-extrabold ${statusBadgeClass(order.status)}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <InfoCard title="Hành trình đơn hàng" icon={<Package className="size-4" />}>
        <Timeline order={order} />
      </InfoCard>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-5">
          <InfoCard title={`Sản phẩm (${order.items.length})`} icon={<ShoppingBag className="size-4" />}>
            <div className="divide-y divide-[#EAE1E4]">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#FAF8F8] sm:size-20">
                    <img src={item.imageUrl || "/logo-quynh-nhi-store-mark.svg"} alt="" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[#2D2226]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#6F6066]">
                      {[item.color && `Màu: ${item.color}`, item.size && `Size: ${item.size}`, item.sku && `SKU: ${item.sku}`].filter(Boolean).join(" · ") || "Sản phẩm"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-[#6F6066]">×{item.quantity} · {money(item.unitPrice)}</span>
                      <strong className="text-[#A43E5F]">{money(item.totalPrice)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Thông tin giao hàng" icon={<MapPin className="size-4" />}>
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-xs font-bold uppercase tracking-wide text-[#A99BA0]">Người nhận</dt><dd className="mt-1 font-bold">{order.receiver.name || "—"}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-[#A99BA0]">Số điện thoại</dt><dd className="mt-1 flex items-center gap-2 font-bold"><Phone className="size-3.5 text-[#D96C8A]" />{order.receiver.phone || "—"}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-[#A99BA0]">Địa chỉ</dt><dd className="mt-1 leading-6 text-[#6F6066]">{order.receiver.address || "—"}</dd></div>
              {order.shipping.carrier || order.shipping.trackingNumber ? <div className="border-t border-[#EAE1E4] pt-4"><dt className="text-xs font-bold uppercase tracking-wide text-[#A99BA0]">Đơn vị giao hàng</dt><dd className="mt-1 font-bold">{[order.shipping.carrier, order.shipping.trackingNumber].filter(Boolean).join(" · ")}</dd></div> : null}
              {order.shipping.estimatedMinutes ? <div className="flex items-center gap-2 text-[#6F6066]"><Clock3 className="size-4 text-[#D96C8A]" />Dự kiến giao trong khoảng {order.shipping.estimatedMinutes} phút</div> : null}
            </dl>
          </InfoCard>

          {order.history.length ? <InfoCard title="Lịch sử đơn hàng" icon={<Clock3 className="size-4" />}><div className="grid gap-4">{order.history.slice().reverse().map((entry) => <div key={entry.id} className="flex gap-3"><span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FCEEF3] text-[#A43E5F]"><CheckCircle2 className="size-4" /></span><div className="min-w-0"><p className="text-sm font-extrabold">{ORDER_STATUS_CONFIG[entry.status].label}</p><p className="mt-1 text-xs text-[#8B7A80]">{dateTime(entry.createdAt)}</p>{entry.publicNote ? <p className="mt-1 text-sm text-[#6F6066]">{entry.publicNote}</p> : null}</div></div>)}</div></InfoCard> : null}
        </div>

        <aside className="grid min-w-0 content-start gap-5">
          <InfoCard title="Thanh toán" icon={<CreditCard className="size-4" />}>
            <dl className="grid gap-3 text-sm">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-1"><dt className="text-[#6F6066]">Phương thức</dt><dd className="max-w-[190px] break-words text-right font-bold">{order.paymentMethod ? paymentMethodLabels[order.paymentMethod] || order.paymentMethod : "—"}</dd></div>
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-1"><dt className="text-[#6F6066]">Trạng thái</dt><dd className={`text-right font-bold ${order.paymentStatus === "PAID" ? "text-emerald-700" : "text-[#A43E5F]"}`}>{paymentStatusLabels[order.paymentStatus] || order.paymentStatus}</dd></div>
              {order.paidAt ? <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-1"><dt className="text-[#6F6066]">Thanh toán lúc</dt><dd className="text-right font-semibold">{dateTime(order.paidAt)}</dd></div> : null}
              {order.payments.find((payment) => payment.transactionId)?.transactionId ? <div className="flex items-start justify-between gap-4"><dt className="text-[#6F6066]">Mã giao dịch</dt><dd className="max-w-[190px] break-all text-right font-semibold">{order.payments.find((payment) => payment.transactionId)?.transactionId}</dd></div> : null}
            </dl>
          </InfoCard>
          <OnlinePaymentPanel
            orderNumber={order.orderNumber}
            paymentMethod={order.paymentMethod || undefined}
            totalAmount={order.totalAmount}
            compact
          />
          <InfoCard title="Tóm tắt đơn hàng" icon={<PackageCheck className="size-4" />}>
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-[#6F6066]">Tạm tính</dt><dd className="font-semibold">{money(order.subtotal)}</dd></div>
              {order.discountAmount > 0 ? <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[#A43E5F]"><dt>Giảm giá{order.discount.couponCode ? ` (${order.discount.couponCode})` : ""}</dt><dd className="font-bold">-{money(order.discountAmount)}</dd></div> : null}
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-[#6F6066]">Phí vận chuyển</dt><dd className="font-semibold">{order.shippingFee ? money(order.shippingFee) : "Miễn phí"}</dd></div>
              {order.taxAmount > 0 ? <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt className="text-[#6F6066]">Thuế</dt><dd className="font-semibold">{money(order.taxAmount)}</dd></div> : null}
              <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[#EAE1E4] pt-4"><dt className="font-extrabold">Tổng cộng</dt><dd className="text-lg font-extrabold text-[#A43E5F]">{money(order.totalAmount)}</dd></div>
            </dl>
          </InfoCard>
          {order.note ? <InfoCard title="Ghi chú giao hàng" icon={<MapPin className="size-4" />}><p className="text-sm leading-6 text-[#6F6066]">{order.note}</p></InfoCard> : null}
          {order.status === "PENDING" ? <div className="rounded-2xl border border-[#F4D6DF] bg-[#FFF7F9] p-4 text-sm leading-6 text-[#6F6066]">Bạn có thể hủy đơn trước khi cửa hàng xác nhận. Vào danh sách đơn hàng để thực hiện.</div> : null}
        </aside>
      </div>
    </div>
  );
}
