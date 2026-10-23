"use client";

/* eslint-disable @next/next/no-img-element */

import {
  AlertCircle,
  Check,
  Clipboard,
  Clock3,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = { orderNumber: string; paymentMethod?: string; totalAmount?: number };
type Order = {
  id: number;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  status?: string;
  placedAt?: string;
};
type PaymentSettings = {
  onlinePaymentEnabled: boolean;
  vietQrBankCode?: string;
  vietQrAccountNumber?: string;
  vietQrAccountName?: string;
  vietQrTemplate?: string;
};

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;

export default function OnlinePaymentPanel({ orderNumber, paymentMethod, totalAmount = 0 }: Props) {
  const [order, setOrder] = useState<Order | null>(
    paymentMethod === "BANK_TRANSFER" && totalAmount > 0
      ? { id: 0, orderNumber, totalAmount, paymentMethod, paymentStatus: "PENDING" }
      : null,
  );
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadOrder = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [listResponse, settingsResponse] = await Promise.all([
        fetch(`/api/me/orders?search=${encodeURIComponent(orderNumber)}&limit=1`, { cache: "no-store" }),
        fetch(`/api/payment-settings?t=${Date.now()}`, { cache: "no-store" }),
      ]);
      if (settingsResponse.ok) setSettings(await settingsResponse.json());
      if (!listResponse.ok) return;
      const list = await listResponse.json();
      const summary = list.items?.[0];
      if (!summary?.id) return;
      const detailResponse = await fetch(`/api/me/orders/${summary.id}?t=${Date.now()}`, { cache: "no-store" });
      if (detailResponse.ok) setOrder(await detailResponse.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!order?.id || ["PAID", "CANCELLED", "REFUNDED"].includes(order.paymentStatus)) return;
    const timer = window.setInterval(() => void loadOrder(true), 5000);
    return () => window.clearInterval(timer);
  }, [loadOrder, order?.id, order?.paymentStatus]);

  const qrUrl = useMemo(() => {
    if (!order || !settings?.onlinePaymentEnabled || !settings.vietQrBankCode || !settings.vietQrAccountNumber) return "";
    const params = new URLSearchParams({
      amount: String(Math.round(order.totalAmount)),
      addInfo: `THANH TOAN DON HANG ${order.orderNumber}`,
      accountName: settings.vietQrAccountName || "",
    });
    return `https://img.vietqr.io/image/${encodeURIComponent(settings.vietQrBankCode)}-${encodeURIComponent(settings.vietQrAccountNumber)}-${encodeURIComponent(settings.vietQrTemplate || "compact2")}.png?${params.toString()}`;
  }, [order, settings]);

  const isBankTransfer = order?.paymentMethod === "BANK_TRANSFER" || paymentMethod === "BANK_TRANSFER";
  const isPaid = order?.paymentStatus === "PAID";
  const isExpired = Boolean(
    order && (order.paymentStatus === "CANCELLED" || order.status === "CANCELLED"),
  );
  const transferContent = order ? `THANH TOAN DON HANG ${order.orderNumber}` : "";

  const copyContent = async () => {
    if (!transferContent) return;
    await navigator.clipboard?.writeText(transferContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (loading || !order || !isBankTransfer) return null;

  return (
    <section className="mx-auto mt-6 max-w-5xl rounded-[2rem] border border-[#F4D6DF] bg-[#FFF8FA] p-6 shadow-[0_14px_40px_rgba(77,47,58,0.06)] sm:p-8">
      <div className="flex items-start gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white ${isPaid ? "text-[#398866]" : isExpired ? "text-[#A43E5F]" : "text-[#D96C8A]"}`}>
          {isPaid ? <Check className="size-6" /> : isExpired ? <AlertCircle className="size-6" /> : <ShieldCheck className="size-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#3B2D32]">
              {isPaid ? "Đã nhận thanh toán" : isExpired ? "Phiên thanh toán đã hết hạn" : "Hoàn tất thanh toán"}
            </h2>
            {!isPaid && !isExpired ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-bold text-[#A43E5F]">
                <Clock3 className="size-3.5" /> Chờ thanh toán
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-[#6F6066]">
            {isPaid ? "Hệ thống đã tự động xác nhận giao dịch của bạn." : isExpired ? "Đơn hàng đã được giải phóng. Vui lòng đặt lại nếu bạn vẫn muốn mua sản phẩm." : "Bạn có thể tiếp tục thanh toán bất cứ lúc nào ở khu vực bên dưới."}
          </p>
        </div>
      </div>

      {!isPaid && !isExpired ? (
        <>
          <div className="mt-6 rounded-2xl border border-white bg-white p-5 text-sm text-[#6F6066]">
            <div className="grid gap-3 sm:grid-cols-3">
              <p><strong className="text-[#3B2D32]">Mã đơn:</strong><br />{order.orderNumber}</p>
              <p><strong className="text-[#3B2D32]">Số tiền:</strong><br />{money(order.totalAmount)}</p>
              <p><strong className="text-[#3B2D32]">Nội dung:</strong><br /><span className="break-words">{transferContent}</span></p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setShowQr((value) => !value)} disabled={!qrUrl} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(217,108,138,0.2)] transition hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-50">
                <QrCode className="size-4" /> {showQr ? "Ẩn mã QR" : "Tiếp tục thanh toán"}
              </button>
              <button type="button" onClick={() => void copyContent()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#EAE1E4] px-5 text-sm font-extrabold text-[#A43E5F] hover:bg-[#FFF7F9]">
                <Clipboard className="size-4" /> {copied ? "Đã sao chép" : "Sao chép nội dung"}
              </button>
              <button type="button" onClick={() => void loadOrder(true)} disabled={refreshing} aria-label="Kiểm tra trạng thái thanh toán" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#EAE1E4] px-4 text-[#A43E5F] hover:bg-[#FFF7F9] disabled:opacity-50">
                <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {showQr && qrUrl ? (
            <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <img src={qrUrl} alt={`Mã VietQR cho đơn ${order.orderNumber}`} className="mx-auto size-64 rounded-2xl bg-white p-2 shadow-sm" />
              <div className="rounded-2xl border border-[#F4D6DF] bg-white p-5 text-sm leading-6 text-[#6F6066]">
                <p className="font-extrabold text-[#3B2D32]">Mở app ngân hàng và quét mã QR</p>
                <p className="mt-2">Chuyển đúng {money(order.totalAmount)} và giữ nguyên nội dung chuyển khoản để hệ thống tự xác nhận.</p>
                <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#398866]"><LoaderCircle className="size-3.5 animate-spin" /> Đang tự động kiểm tra thanh toán</p>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
