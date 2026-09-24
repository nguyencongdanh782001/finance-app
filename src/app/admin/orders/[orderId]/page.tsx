"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hook/use-toast";
import type {
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/interface/financeAPI";
import {
  canAdminCancelOnlineOrder,
  canManuallyMarkOrderPaid,
  ONLINE_STATUS_FLOW,
  ORDER_STATUS_CONFIG,
} from "@/lib/orders/order-status";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  MapPin,
  Package,
  ImageOff,
  Phone,
  ReceiptText,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Order = {
  id: number;
  orderNumber: string;
  status: OrderStatusValue;
  paymentMethod: PaymentMethodValue | null;
  paymentStatus: PaymentStatusValue;
  isPaid: boolean;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  receiverName: string | null;
  receiverPhone: string | null;
  receiverAddress: string | null;
  receiverWard: string | null;
  receiverDistrict: string | null;
  receiverProvince: string | null;
  shippingDistanceKm: number | null;
  shippingEstimatedMinutes: number | null;
  shippingQuoteProvider: string | null;
  note: string | null;
  placedAt: string;
  updatedAt: string;
  user: {
    id: number;
    displayName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  items: Array<{
    id: number;
    productTitle: string;
    productImageUrl: string | null;
    sku: string | null;
    color: string | null;
    size: string | null;
    quantity: number;
    originalUnitPrice: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  statusHistories: Array<{
    id: number;
    previousStatus: OrderStatusValue | null;
    currentStatus: OrderStatusValue;
    note: string | null;
    createdAt: string;
    changedBy: { displayName: string | null; email: string | null } | null;
  }>;
  shipments: Array<{
    carrier: string | null;
    trackingNumber: string | null;
    status: string;
    estimatedMinutes: number | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  }>;
};

const PAYMENT_LABELS: Record<PaymentStatusValue, string> = {
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
const METHOD_LABELS: Record<PaymentMethodValue, string> = {
  CASH: "Tiền mặt",
  COD: "COD",
  CARD: "Thẻ",
  BANK_TRANSFER: "Chuyển khoản",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
};
const ACTION_LABELS: Partial<Record<OrderStatusValue, string>> = {
  CONFIRMED: "Xác nhận đơn",
  PREPARING: "Bắt đầu chuẩn bị",
  SHIPPING: "Bắt đầu giao hàng",
  DELIVERED: "Xác nhận đã giao",
};
const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
const dateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function InfoCard({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: typeof UserRound;
}) {
  return (
    <AdminSection className="p-4! sm:p-5!">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="font-semibold text-(--admin-text)">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </AdminSection>
  );
}

function ProductImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title: string;
}) {
  const [visible, setVisible] = useState(Boolean(imageUrl));

  useEffect(() => {
    setVisible(Boolean(imageUrl));
  }, [imageUrl]);

  if (!imageUrl || !visible) {
    return (
      <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-(--admin-background-subtle) text-(--admin-text-muted)">
        <ImageOff className="size-5" />
      </span>
    );
  }

  return (
    <span className="size-14 shrink-0 overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-background-subtle)">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="size-full object-cover"
        onError={() => setVisible(false)}
      />
    </span>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.orderId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrder(data);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể tải đơn hàng.",
      );
    }
  }, [params.orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = async (body: Record<string, string>) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể cập nhật đơn hàng.");
      toast({
        title:
          body.action === "cancel"
            ? "Đã hủy đơn và hoàn tồn kho"
            : body.action === "mark_paid"
              ? "Đã xác nhận đơn hàng đã thanh toán"
              : "Đã cập nhật trạng thái đơn",
        className: "bg-green-16 text-white",
      });
      setCancelOpen(false);
      setPaymentConfirmOpen(false);
      setReason("");
      await load();
    } catch (cause) {
      toast({
        title:
          cause instanceof Error
            ? cause.message
            : "Không thể cập nhật đơn hàng.",
        className: "bg-red-1 text-white",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (error)
    return (
      <AdminPageContainer>
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      </AdminPageContainer>
    );
  if (!order)
    return (
      <main className="flex min-h-96 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );

  const nextStatus = ONLINE_STATUS_FLOW[order.status] as
    OrderStatusValue | undefined;
  const address = [
    order.receiverAddress,
    order.receiverWard,
    order.receiverDistrict,
    order.receiverProvince,
  ]
    .filter(Boolean)
    .join(", ");
  const canCancel = canAdminCancelOnlineOrder(order.status);
  const canMarkPaid = canManuallyMarkOrderPaid(
    order.status,
    order.paymentStatus,
  );

  return (
    <AdminPageContainer>
      <AdminPageHeader
        breadcrumb={
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            <ArrowLeft className="size-3.5" /> Đơn hàng online
          </Link>
        }
        title={order.orderNumber}
        description={`Đặt lúc ${dateTime(order.placedAt)} · Cập nhật ${dateTime(order.updatedAt)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {canCancel ? (
              <Button
                type="button"
                variant="ghost"
                className="h-10 border border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="size-4" /> Hủy đơn
              </Button>
            ) : null}
            {nextStatus ? (
              <Button
                type="button"
                variant="adminPrimary"
                className="h-10"
                disabled={submitting}
                onClick={() => void mutate({ status: nextStatus })}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {ACTION_LABELS[nextStatus] || "Cập nhật trạng thái"}
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5">
          <AdminSection>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-(--admin-text-muted)">
                  Trạng thái hiện tại
                </p>
                <p className="mt-1 text-lg font-bold text-(--admin-text)">
                  {ORDER_STATUS_CONFIG[order.status].label}
                </p>
                <p className="mt-1 text-sm text-(--admin-text-secondary)">
                  {ORDER_STATUS_CONFIG[order.status].description}
                </p>
              </div>
              <span className="w-fit rounded-full bg-(--admin-primary-soft) px-3 py-1.5 text-sm font-semibold text-primary">
                {PAYMENT_LABELS[order.paymentStatus]}
              </span>
            </div>
            {order.status === "CANCELLED" && order.paymentStatus === "PAID" ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                Đơn đã hủy nhưng khoản thanh toán vẫn là đã thu. Cần xử lý hoàn
                tiền riêng qua kênh thanh toán.
              </p>
            ) : null}
          </AdminSection>

          <InfoCard title={`Sản phẩm (${order.items.length})`} icon={Package}>
            <div className="divide-y divide-(--admin-border)">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <ProductImage
                    imageUrl={item.productImageUrl}
                    title={item.productTitle}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-(--admin-text)">
                      {item.productTitle}
                    </p>
                    <p className="mt-1 text-xs text-(--admin-text-muted)">
                      {[item.color, item.size, item.sku]
                        .filter(Boolean)
                        .join(" · ") || "Sản phẩm"}
                    </p>
                    <p className="mt-1 text-sm text-(--admin-text-secondary)">
                      {item.quantity} × {money(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-(--admin-text)">
                    {money(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Lịch sử xử lý" icon={Clock3}>
            <div className="space-y-0">
              {order.statusHistories.map((history, index) => (
                <div
                  key={history.id}
                  className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
                >
                  <div className="relative flex justify-center">
                    <span className="mt-1 size-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                    {index < order.statusHistories.length - 1 ? (
                      <span className="absolute top-4 h-[calc(100%-8px)] w-px bg-(--admin-border)" />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--admin-text)">
                      {ORDER_STATUS_CONFIG[history.currentStatus].label}
                    </p>
                    <p className="mt-1 text-xs text-(--admin-text-muted)">
                      {dateTime(history.createdAt)}
                      {history.changedBy
                        ? ` · ${history.changedBy.displayName || history.changedBy.email}`
                        : ""}
                    </p>
                    {history.note ? (
                      <p className="mt-1 text-sm text-(--admin-text-secondary)">
                        {history.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>

        <div className="space-y-5">
          <InfoCard title="Khách hàng & giao nhận" icon={UserRound}>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-(--admin-text)">
                {order.receiverName || order.user?.displayName || "Khách hàng"}
              </p>
              {order.receiverPhone || order.user?.phone ? (
                <p className="flex gap-2 text-(--admin-text-secondary)">
                  <Phone className="mt-0.5 size-4 shrink-0" />
                  {order.receiverPhone || order.user?.phone}
                </p>
              ) : null}
              <p className="flex gap-2 leading-6 text-(--admin-text-secondary)">
                <MapPin className="mt-1 size-4 shrink-0" />
                {address || "Chưa có địa chỉ"}
              </p>
              {order.user?.email ? (
                <p className="text-(--admin-text-muted)">{order.user.email}</p>
              ) : null}
            </div>
          </InfoCard>
          <InfoCard title="Vận chuyển" icon={Truck}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-(--admin-text-muted)">Khoảng cách</p>
                <p className="mt-1 font-semibold">
                  {order.shippingDistanceKm
                    ? `${order.shippingDistanceKm} km`
                    : "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--admin-text-muted)">Dự kiến</p>
                <p className="mt-1 font-semibold">
                  {order.shippingEstimatedMinutes
                    ? `${order.shippingEstimatedMinutes} phút`
                    : "Chưa có"}
                </p>
              </div>
              {order.shipments[0]?.trackingNumber ? (
                <div className="col-span-2">
                  <p className="text-xs text-(--admin-text-muted)">
                    Mã vận đơn
                  </p>
                  <p className="mt-1 font-semibold">
                    {order.shipments[0].trackingNumber}
                  </p>
                </div>
              ) : null}
            </div>
          </InfoCard>
          <InfoCard title="Thanh toán" icon={ReceiptText}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-(--admin-text-secondary)">
                <span>Tạm tính</span>
                <span>{money(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-(--admin-text-secondary)">
                <span>Giảm giá</span>
                <span>-{money(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-(--admin-text-secondary)">
                <span>Phí giao hàng</span>
                <span>{money(order.shippingFee)}</span>
              </div>
              {order.taxAmount ? (
                <div className="flex justify-between text-(--admin-text-secondary)">
                  <span>Thuế</span>
                  <span>{money(order.taxAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-(--admin-border) pt-3 text-base font-bold text-(--admin-text)">
                <span>Tổng cộng</span>
                <span>{money(order.totalAmount)}</span>
              </div>
              <div className="pt-2 text-xs text-(--admin-text-muted)">
                {order.paymentMethod
                  ? METHOD_LABELS[order.paymentMethod]
                  : "Chưa có phương thức thanh toán"}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-(--admin-background-subtle) p-3">
                <div>
                  <p className="text-xs text-(--admin-text-muted)">
                    Đã thanh toán
                  </p>
                  <p className="mt-1 font-semibold text-(--admin-text)">
                    {money(order.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--admin-text-muted)">Còn lại</p>
                  <p className="mt-1 font-semibold text-(--admin-text)">
                    {money(order.remainingAmount)}
                  </p>
                </div>
              </div>
              {canMarkPaid ? (
                <Button
                  type="button"
                  variant="adminPrimary"
                  className="mt-3 h-10 w-full"
                  disabled={submitting}
                  onClick={() => setPaymentConfirmOpen(true)}
                >
                  <CircleDollarSign className="size-4" />
                  Xác nhận đã thanh toán
                </Button>
              ) : null}
            </div>
          </InfoCard>
        </div>
      </section>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md rounded-2xl border-(--admin-border) bg-white p-5">
          <DialogTitle className="text-lg text-(--admin-text)">
            Hủy đơn {order.orderNumber}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6 text-(--admin-text-secondary)">
            Tồn kho sẽ được hoàn lại. Nếu đơn đã thanh toán, hệ thống không tự
            đánh dấu hoàn tiền.
          </DialogDescription>
          <label className="mt-4 block text-sm font-semibold text-(--admin-text)">
            Lý do hủy <span className="text-rose-500">*</span>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do để khách hàng có thể theo dõi"
              className="mt-2 min-h-24"
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCancelOpen(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="adminDanger"
              disabled={submitting || !reason.trim()}
              onClick={() => void mutate({ action: "cancel", reason })}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Xác nhận hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentConfirmOpen} onOpenChange={setPaymentConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl border-(--admin-border) bg-white p-5">
          <DialogTitle className="text-lg text-(--admin-text)">
            Xác nhận thanh toán
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6 text-(--admin-text-secondary)">
            Xác nhận đã nhận đủ {money(order.totalAmount)} cho đơn{" "}
            <span className="font-semibold text-(--admin-text)">
              {order.orderNumber}
            </span>
            . Thao tác sẽ được lưu vào nhật ký quản trị.
          </DialogDescription>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            Chỉ xác nhận sau khi đã kiểm tra tiền mặt, chuyển khoản hoặc giao
            dịch từ nhà cung cấp thanh toán.
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => setPaymentConfirmOpen(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="adminPrimary"
              disabled={submitting}
              onClick={() => void mutate({ action: "mark_paid" })}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CircleDollarSign className="size-4" />
              )}
              Xác nhận đã nhận tiền
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
