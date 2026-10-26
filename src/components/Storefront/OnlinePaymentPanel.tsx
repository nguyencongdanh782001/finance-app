"use client";

import { AlertCircle, Check, Clock3, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Props = { orderNumber: string; paymentMethod?: string; totalAmount?: number };
type Order = { id: number; orderNumber: string; totalAmount: number; paymentMethod: string | null; paymentStatus: string; status?: string };
const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;

export default function OnlinePaymentPanel({ orderNumber, paymentMethod, totalAmount = 0 }: Props) {
  const [order, setOrder] = useState<Order | null>(paymentMethod === "BANK_TRANSFER" && totalAmount > 0 ? { id: 0, orderNumber, totalAmount, paymentMethod, paymentStatus: "PENDING" } : null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  const loadOrder = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const listResponse = await fetch(`/api/me/orders?search=${encodeURIComponent(orderNumber)}&limit=1`, { cache: "no-store" });
      if (!listResponse.ok) return;
      const list = await listResponse.json();
      const summary = list.items?.[0];
      if (!summary?.id) return;
      const detailResponse = await fetch(`/api/me/orders/${summary.id}?t=${Date.now()}`, { cache: "no-store" });
      if (detailResponse.ok) setOrder(await detailResponse.json());
    } finally { setLoading(false); setRefreshing(false); }
  }, [orderNumber]);

  useEffect(() => { void loadOrder(); }, [loadOrder]);
  useEffect(() => {
    if (!order?.id || ["PAID", "CANCELLED", "REFUNDED"].includes(order.paymentStatus)) return;
    const timer = window.setInterval(() => void loadOrder(true), 5000);
    return () => window.clearInterval(timer);
  }, [loadOrder, order?.id, order?.paymentStatus]);

  const openVnpay = async () => {
    setPaying(true); setMessage("");
    const response = await fetch("/api/payments/vnpay/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber }) });
    const data = await response.json().catch(() => ({}));
    setPaying(false);
    if (!response.ok || !data.paymentUrl) return setMessage(data.message || "Chưa thể mở VNPAY.");
    window.location.assign(data.paymentUrl);
  };

  const isBankTransfer = order?.paymentMethod === "BANK_TRANSFER" || paymentMethod === "BANK_TRANSFER";
  const isPaid = order?.paymentStatus === "PAID";
  const isExpired = Boolean(order && ["CANCELLED", "REFUNDED"].includes(order.paymentStatus) || order?.status === "CANCELLED");
  if (loading || !order || !isBankTransfer) return null;

  return <section className="mx-auto mt-6 max-w-5xl rounded-[2rem] border border-[#F4D6DF] bg-[#FFF8FA] p-6 shadow-[0_14px_40px_rgba(77,47,58,0.06)] sm:p-8">
    <div className="flex items-start gap-3">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white ${isPaid ? "text-[#398866]" : isExpired ? "text-[#A43E5F]" : "text-[#D96C8A]"}`}>{isPaid ? <Check className="size-6" /> : isExpired ? <AlertCircle className="size-6" /> : <ShieldCheck className="size-6" />}</div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-extrabold text-[#3B2D32]">{isPaid ? "Đã nhận thanh toán" : isExpired ? "Phiên thanh toán đã hết hạn" : "Thanh toán qua VNPAY"}</h2>{!isPaid && !isExpired ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-bold text-[#A43E5F]"><Clock3 className="size-3.5" /> Chờ thanh toán</span> : null}</div><p className="mt-1 text-sm leading-6 text-[#6F6066]">{isPaid ? "Hệ thống đã tự động xác nhận giao dịch của bạn." : isExpired ? "Đơn hàng đã hết hạn thanh toán." : "VNPAY sẽ xử lý thanh toán và gửi kết quả về website tự động."}</p></div>
    </div>
    {!isPaid && !isExpired ? <div className="mt-6 rounded-2xl border border-white bg-white p-5"><div className="grid gap-3 text-sm text-[#6F6066] sm:grid-cols-2"><p><strong className="text-[#3B2D32]">Mã đơn:</strong><br />{order.orderNumber}</p><p><strong className="text-[#3B2D32]">Số tiền:</strong><br />{money(order.totalAmount)}</p></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void openVnpay()} disabled={paying} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-extrabold text-white hover:bg-[#C85B7B] disabled:opacity-50">{paying ? <LoaderCircle className="size-4 animate-spin" /> : <ExternalLink className="size-4" />} {paying ? "Đang mở VNPAY..." : "Tiếp tục thanh toán"}</button><button type="button" onClick={() => void loadOrder(true)} disabled={refreshing} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#EAE1E4] px-4 text-sm font-bold text-[#A43E5F] hover:bg-[#FFF7F9] disabled:opacity-50"><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} /> Kiểm tra</button></div>{message ? <p className="mt-3 text-sm font-semibold text-red-600">{message}</p> : null}</div> : null}
  </section>;
}
