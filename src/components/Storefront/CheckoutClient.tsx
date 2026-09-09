"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StorefrontShell from "@/components/Storefront/StorefrontShell";

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
type IntentItem = { variantId: number; quantity: number; title: string; price: number; imageUrl: string; variantLabel: string; available: number };

export default function CheckoutClient() {
  const params = useSearchParams(); const router = useRouter(); const token = params.get("intent") || "";
  const [items, setItems] = useState<IntentItem[]>([]); const [form, setForm] = useState({ receiverName: "", receiverPhone: "", receiverAddress: "", paymentMethod: "COD" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!token) { setError("Phiên thanh toán không hợp lệ."); return; }
    const load = async () => {
      const cartResponse = await fetch(`/api/checkout/cart-intent?token=${encodeURIComponent(token)}`);
      if (cartResponse.ok) { const data = await cartResponse.json(); setItems(data.items || []); return; }
      const buyNowResponse = await fetch(`/api/checkout/buy-now-intent?token=${encodeURIComponent(token)}`);
      const data = await buyNowResponse.json().catch(() => ({}));
      if (!buyNowResponse.ok) throw new Error(data.message || "Phiên thanh toán đã hết hạn.");
      setItems([{ variantId: data.variantId, quantity: data.quantity, title: data.title, price: data.price, imageUrl: data.imageUrl, variantLabel: data.variantLabel, available: data.available }]);
    };
    load().catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải thông tin thanh toán."));
  }, [token]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/orders/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intent: token, ...form }) }); const data = await response.json().catch(() => ({})); setBusy(false); if (!response.ok) return setError(data.message || "Không thể tạo đơn hàng."); router.replace(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`); };
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <StorefrontShell><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><h1 className="text-2xl font-extrabold">Thanh toán</h1>{error ? <p className="mt-5 bg-[#FFF1F3] p-4 text-sm font-semibold text-[#C84F64]">{error}</p> : null}{items.length ? <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]"><div className="order-2 grid gap-4 lg:order-1"><label className="grid gap-1.5 text-sm font-semibold">Họ tên<input required value={form.receiverName} onChange={(event) => setForm({ ...form, receiverName: event.target.value })} className="h-11 border border-[#EAE1E4] bg-white px-3 outline-none focus:border-[#D96C8A]" /></label><label className="grid gap-1.5 text-sm font-semibold">Số điện thoại<input required value={form.receiverPhone} onChange={(event) => setForm({ ...form, receiverPhone: event.target.value })} className="h-11 border border-[#EAE1E4] bg-white px-3 outline-none focus:border-[#D96C8A]" /></label><label className="grid gap-1.5 text-sm font-semibold">Địa chỉ nhận hàng<textarea required value={form.receiverAddress} onChange={(event) => setForm({ ...form, receiverAddress: event.target.value })} className="min-h-24 border border-[#EAE1E4] bg-white p-3 outline-none focus:border-[#D96C8A]" /></label><label className="grid gap-1.5 text-sm font-semibold">Phương thức thanh toán<select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })} className="h-11 border border-[#EAE1E4] bg-white px-3"><option value="COD">Thanh toán khi nhận hàng</option><option value="MOMO">MoMo</option></select></label><button disabled={busy} className="h-12 bg-[#D96C8A] text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang tạo đơn..." : "Đặt hàng"}</button></div><aside className="order-1 h-fit border border-[#EAE1E4] bg-white p-4 lg:order-2"><h2 className="text-sm font-extrabold">Sản phẩm đã chọn</h2><div className="mt-3 space-y-3">{items.map((item) => <div key={item.variantId} className="flex gap-3"><img src={item.imageUrl} alt={item.title} className="size-16 object-cover" /><div className="min-w-0 text-xs"><p className="line-clamp-2 font-bold">{item.title}</p><p className="mt-1 text-[#6F6066]">{item.variantLabel} · SL {item.quantity}</p><p className="mt-1 font-bold text-[#A43E5F]">{money(item.price * item.quantity)}</p></div></div>)}</div><p className="mt-4 border-t border-[#EAE1E4] pt-4 text-lg font-extrabold text-[#A43E5F]">{money(total)}</p></aside></form> : null}<Link href="/cart" className="mt-6 inline-block text-sm font-bold text-[#A43E5F]">← Quay lại giỏ hàng</Link></main></StorefrontShell>;
}
