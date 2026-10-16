"use client";

/* eslint-disable @next/next/no-img-element */

import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = { orderNumber: string; paymentMethod?: string; totalAmount?: number };
type Order = {
  id: number;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
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
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const [listResponse, settingsResponse] = await Promise.all([
        fetch(`/api/me/orders?search=${encodeURIComponent(orderNumber)}&limit=1`),
        fetch(`/api/payment-settings?t=${Date.now()}`, { cache: "no-store" }),
      ]);
      if (settingsResponse.ok) setSettings(await settingsResponse.json());
      if (!listResponse.ok) return;
      const list = await listResponse.json();
      const summary = list.items?.[0];
      if (!summary?.id) return;
      const detailResponse = await fetch(`/api/me/orders/${summary.id}`);
      if (detailResponse.ok) setOrder(await detailResponse.json());
    };
    void load().finally(() => setLoading(false));
  }, [orderNumber]);

  const qrUrl = useMemo(() => {
    if (!order || !settings?.onlinePaymentEnabled || !settings.vietQrBankCode || !settings.vietQrAccountNumber) return "";
    const params = new URLSearchParams({
      amount: String(Math.round(order.totalAmount)),
      addInfo: `THANH TOAN DON HANG ${order.orderNumber}`,
      accountName: settings.vietQrAccountName || "",
    });
    return `https://img.vietqr.io/image/${encodeURIComponent(settings.vietQrBankCode)}-${encodeURIComponent(settings.vietQrAccountNumber)}-${encodeURIComponent(settings.vietQrTemplate || "compact2")}.png?${params.toString()}`;
  }, [order, settings]);

  const isBankTransfer =
    order?.paymentMethod === "BANK_TRANSFER" || paymentMethod === "BANK_TRANSFER";

  if (loading || !order || !isBankTransfer || !qrUrl) return null;

  const reported = ["PROCESSING", "PAID"].includes(order.paymentStatus);
  const confirm = async () => {
    setConfirming(true);
    setMessage("");
    if (!order.id) return;
    const response = await fetch(`/api/me/orders/${order.id}/payment-confirmation`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setConfirming(false);
    if (!response.ok) {
      setMessage(data.message || "Không thể gửi xác nhận thanh toán.");
      return;
    }
    setOrder((current) => current ? { ...current, paymentStatus: data.paymentStatus } : current);
    setMessage("Đã báo chuyển khoản. Admin sẽ kiểm tra và xác nhận đơn cho bạn.");
  };

  return (
    <section className="mx-auto mt-6 max-w-5xl rounded-[2rem] border border-[#F4D6DF] bg-[#FFF8FA] p-6 shadow-[0_14px_40px_rgba(77,47,58,0.06)] sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#D96C8A]"><ShieldCheck className="size-6" /></div>
        <div>
          <h2 className="text-lg font-extrabold text-[#3B2D32]">Thanh toán VietQR</h2>
          <p className="mt-1 text-sm leading-6 text-[#6F6066]">Quét mã bên dưới và chuyển đúng {money(order.totalAmount)}. Nội dung chuyển khoản đã gắn với mã đơn hàng.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <img src={qrUrl} alt={`Mã VietQR cho đơn ${order.orderNumber}`} className="mx-auto size-64 rounded-2xl bg-white p-2 shadow-sm" />
        <div className="rounded-2xl border border-white bg-white p-5 text-sm text-[#6F6066]">
          <p><strong className="text-[#3B2D32]">Mã đơn:</strong> {order.orderNumber}</p>
          <p className="mt-2"><strong className="text-[#3B2D32]">Số tiền:</strong> {money(order.totalAmount)}</p>
          <p className="mt-2"><strong className="text-[#3B2D32]">Nội dung:</strong> THANH TOAN DON HANG {order.orderNumber}</p>
          <button type="button" onClick={() => void confirm()} disabled={confirming || reported || !order.id} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {confirming ? <LoaderCircle className="size-4 animate-spin" /> : reported ? <Check className="size-4" /> : null}
            {order.paymentStatus === "PAID" ? "Đã xác nhận thanh toán" : reported ? "Đã báo chuyển khoản" : "Tôi đã chuyển khoản"}
          </button>
          {message ? <p className="mt-3 text-sm font-semibold text-[#398866]">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
