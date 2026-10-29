"use client";

/* QR image URL is generated dynamically by VietQR and is intentionally not optimized by Next Image. */
/* eslint-disable @next/next/no-img-element */

import {
  AlertCircle,
  Banknote,
  Check,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  orderNumber: string;
  paymentMethod?: string;
  totalAmount?: number;
};
type Order = {
  id: number;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  status?: string;
};
type PaymentSettings = {
  vietQrBankCode: string | null;
  vietQrAccountNumber: string | null;
  vietQrAccountName: string | null;
  vietQrTemplate: string;
};
const money = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;

export default function OnlinePaymentPanel({
  orderNumber,
  paymentMethod,
  totalAmount = 0,
}: Props) {
  const [order, setOrder] = useState<Order | null>(
    paymentMethod === "BANK_TRANSFER" && totalAmount > 0
      ? {
          id: 0,
          orderNumber,
          totalAmount,
          paymentMethod,
          paymentStatus: "PENDING",
        }
      : null,
  );
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  const loadOrder = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const listResponse = await fetch(
          `/api/me/orders?search=${encodeURIComponent(orderNumber)}&limit=1`,
          { cache: "no-store" },
        );
        if (!listResponse.ok) return;
        const list = await listResponse.json();
        const summary = list.items?.[0];
        if (!summary?.id) return;
        const detailResponse = await fetch(
          `/api/me/orders/${summary.id}?t=${Date.now()}`,
          { cache: "no-store" },
        );
        if (detailResponse.ok) setOrder(await detailResponse.json());
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderNumber],
  );

  useEffect(() => {
    void loadOrder();
    fetch(`/api/payment-settings?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => undefined);
  }, [loadOrder]);

  useEffect(() => {
    if (
      !order?.id ||
      ["PAID", "CANCELLED", "REFUNDED"].includes(order.paymentStatus)
    )
      return;
    const timer = window.setInterval(() => void loadOrder(true), 5000);
    return () => window.clearInterval(timer);
  }, [loadOrder, order?.id, order?.paymentStatus]);

  const reportTransfer = async () => {
    if (!order?.id) return;
    setConfirming(true);
    setMessage("");
    const response = await fetch(
      `/api/me/orders/${order.id}/payment-confirmation`,
      { method: "POST" },
    );
    const data = await response.json().catch(() => ({}));
    setConfirming(false);
    if (!response.ok)
      return setMessage(data.message || "Chưa thể gửi thông báo cho admin.");
    setOrder((current) =>
      current ? { ...current, paymentStatus: "PROCESSING" } : current,
    );
  };

  const isBankTransfer =
    order?.paymentMethod === "BANK_TRANSFER" ||
    paymentMethod === "BANK_TRANSFER";
  const isPaid = order?.paymentStatus === "PAID";
  const isReported = order?.paymentStatus === "PROCESSING";
  const isExpired = Boolean(
    (order && ["CANCELLED", "REFUNDED"].includes(order.paymentStatus)) ||
    order?.status === "CANCELLED",
  );
  const qrUrl = useMemo(() => {
    if (!settings?.vietQrBankCode || !settings.vietQrAccountNumber || !order)
      return "";
    const params = new URLSearchParams({
      amount: String(Math.round(order.totalAmount)),
      addInfo: `THANH TOAN DON HANG ${order.orderNumber}`,
      accountName: settings.vietQrAccountName || "",
    });
    return `https://img.vietqr.io/image/${encodeURIComponent(settings.vietQrBankCode)}-${encodeURIComponent(settings.vietQrAccountNumber)}-${encodeURIComponent(settings.vietQrTemplate || "compact2")}.png?${params.toString()}`;
  }, [order, settings]);

  if (loading || !order || !isBankTransfer) return null;

  return (
    <section className="mx-auto mt-6 max-w-5xl rounded-[2rem] border border-[#F4D6DF] bg-[#FFF8FA] p-6 shadow-[0_14px_40px_rgba(77,47,58,0.06)] sm:p-8">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white ${isPaid ? "text-[#398866]" : isExpired ? "text-[#A43E5F]" : "text-[#D96C8A]"}`}
        >
          {isPaid ? (
            <Check className="size-6" />
          ) : isExpired ? (
            <AlertCircle className="size-6" />
          ) : (
            <Banknote className="size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#3B2D32]">
              {isPaid
                ? "Đã xác nhận thanh toán"
                : isExpired
                  ? "Đơn hàng đã hết hiệu lực"
                  : "Chuyển khoản ngân hàng"}
            </h2>
            {!isPaid && !isExpired ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-bold text-[#A43E5F]">
                <Clock3 className="size-3.5" />
                {isReported ? "Chờ admin kiểm tra" : "Chờ thanh toán"}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-[#6F686B]">
            {isPaid
              ? "Admin đã kiểm tra và xác nhận khoản chuyển khoản của bạn."
              : isExpired
                ? "Đơn hàng đã hết hiệu lực thanh toán."
                : isReported
                  ? "Bạn đã báo chuyển khoản. Admin sẽ kiểm tra giao dịch và cập nhật đơn hàng."
                  : "Vui lòng chuyển đúng số tiền, đúng nội dung đơn hàng. Sau đó bấm báo đã chuyển khoản để admin kiểm tra."}
          </p>
        </div>
      </div>

      {!isPaid && !isExpired ? (
        <div className="mt-6 grid gap-5 rounded-2xl border border-white bg-white p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <div className="grid gap-3 text-sm text-[#6F686B] sm:grid-cols-2">
              <p>
                <strong className="text-[#3B2D32]">Mã đơn:</strong>
                <br />
                {order.orderNumber}
              </p>
              <p>
                <strong className="text-[#3B2D32]">Số tiền:</strong>
                <br />
                {money(order.totalAmount)}
              </p>
            </div>
            <div className="mt-5 space-y-2 rounded-xl bg-[#FFFCFA] p-4 text-sm text-[#6F686B]">
              <p>
                <strong className="text-[#3B2D32]">Ngân hàng / BIN:</strong>{" "}
                {settings?.vietQrBankCode || "Chưa cấu hình"}
              </p>
              <p>
                <strong className="text-[#3B2D32]">Số tài khoản:</strong>{" "}
                {settings?.vietQrAccountNumber || "Chưa cấu hình"}
              </p>
              <p>
                <strong className="text-[#3B2D32]">Chủ tài khoản:</strong>{" "}
                {settings?.vietQrAccountName || "Chưa cấu hình"}
              </p>
              <p>
                <strong className="text-[#3B2D32]">Nội dung:</strong> THANH TOAN
                DON HANG {order.orderNumber}
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void reportTransfer()}
                disabled={confirming || isReported}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-extrabold text-white hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirming ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                {confirming
                  ? "Đang gửi..."
                  : isReported
                    ? "Đã báo chuyển khoản"
                    : "Tôi đã chuyển khoản"}
              </button>
              <button
                type="button"
                onClick={() => void loadOrder(true)}
                disabled={refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#EAE1E4] px-4 text-sm font-bold text-[#A43E5F] hover:bg-[#FFF7F9] disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Kiểm tra
              </button>
            </div>
            {message ? (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {message}
              </p>
            ) : null}
          </div>
          {qrUrl ? (
            <div className="rounded-xl border border-[#EAE1E4] bg-[#FFFCFA] p-3 text-center">
              <img
                src={qrUrl}
                alt="Mã QR chuyển khoản"
                className="mx-auto size-44 rounded-lg bg-white object-contain"
              />
              <p className="mt-2 text-xs font-bold text-[#6F686B]">
                Quét mã để chuyển khoản
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
