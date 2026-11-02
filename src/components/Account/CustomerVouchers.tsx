"use client";

import { Check, Clipboard, LoaderCircle, ShoppingBag, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  maximumDiscount: number | null;
  minimumOrderValue: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  status: "ACTIVE" | "USED" | "EXPIRED" | "EXHAUSTED" | "UPCOMING" | "PAUSED";
  remainingUsage: number | null;
  source: "MANUAL" | "BIRTHDAY";
};

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}đ`;
const date = (value: string | null) =>
  value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value)) : "Không thời hạn";

const statusLabels: Record<Voucher["status"], string> = {
  ACTIVE: "Có thể sử dụng",
  USED: "Đã sử dụng",
  EXPIRED: "Đã hết hạn",
  EXHAUSTED: "Đã hết lượt",
  UPCOMING: "Sắp diễn ra",
  PAUSED: "Tạm dừng",
};

const discountLabel = (voucher: Voucher) =>
  voucher.discountType === "PERCENTAGE"
    ? `Giảm ${voucher.discountValue}%${voucher.maximumDiscount ? ` tối đa ${money(voucher.maximumDiscount)}` : ""}`
    : voucher.discountType === "FREE_SHIPPING"
      ? "Miễn phí vận chuyển"
      : `Giảm ${money(voucher.discountValue)}`;

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const [copied, setCopied] = useState(false);
  const usable = voucher.status === "ACTIVE";
  const copyCode = async () => {
    await navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <article className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_8px_26px_rgba(77,47,58,0.04)] ${usable ? "border-[#F4D6DF]" : "border-[#EAE1E4] opacity-75"}`}>
      <div className="absolute inset-y-0 left-0 w-1 bg-[#D96C8A]" />
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FCEEF3] text-[#D96C8A]"><Tag className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-extrabold text-[#2D2226]">{voucher.title}</h2>
              <p className="mt-1 text-lg font-extrabold text-[#A43E5F]">{discountLabel(voucher)}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${usable ? "bg-[#EAF7F0] text-[#317A55]" : "bg-[#F3EFF0] text-[#7E7075]"}`}>
              {statusLabels[voucher.status]}
            </span>
          </div>
          {voucher.description ? <p className="mt-3 text-sm leading-6 text-[#6F6066]">{voucher.description}</p> : null}
          <div className="mt-4 grid gap-1 text-xs text-[#8B7A80]">
            <p>Hạn dùng: <strong className="text-[#6F6066]">{date(voucher.expiresAt)}</strong></p>
            {voucher.minimumOrderValue ? <p>Đơn tối thiểu: <strong className="text-[#6F6066]">{money(voucher.minimumOrderValue)}</strong></p> : null}
            {voucher.remainingUsage !== null ? <p>Còn lại: <strong className="text-[#6F6066]">{voucher.remainingUsage} lượt</strong></p> : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-[#FFF4F7] px-3 py-2 text-sm font-extrabold tracking-[0.12em] text-[#A43E5F]">{voucher.code}</code>
            {usable ? <button type="button" onClick={() => void copyCode()} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#EAE1E4] px-3 text-xs font-bold text-[#6F6066] hover:border-[#D96C8A] hover:text-[#A43E5F]">{copied ? <Check className="size-3.5 text-[#317A55]" /> : <Clipboard className="size-3.5" />}{copied ? "Đã sao chép" : "Sao chép mã"}</button> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CustomerVouchers() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "USED">("ALL");

  useEffect(() => {
    fetch("/api/customer/coupons?view=wallet", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Không thể tải voucher.");
        setVouchers(data.coupons || []);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Không thể tải voucher."));
  }, []);

  const visibleVouchers = useMemo(
    () => (vouchers || []).filter((voucher) => filter === "ALL" || (filter === "ACTIVE" ? voucher.status === "ACTIVE" : voucher.status === "USED")),
    [filter, vouchers],
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-[#EAE1E4] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A99BA0]">Ưu đãi dành cho bạn</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Voucher của tôi</h1><p className="mt-2 text-sm text-[#6F6066]">Lưu và sử dụng các mã giảm giá trong đơn hàng tiếp theo.</p></div>
        <button type="button" onClick={() => router.push("/products")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-4 text-sm font-extrabold text-white hover:bg-[#C85B7B]"><ShoppingBag className="size-4" />Mua sắm ngay</button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {([["ALL", "Tất cả"], ["ACTIVE", "Có thể dùng"], ["USED", "Đã sử dụng"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === value ? "bg-[#FCEEF3] text-[#A43E5F]" : "bg-white text-[#6F6066] ring-1 ring-[#EAE1E4]"}`}>{label}</button>)}
      </div>
      {vouchers === null && !error ? <div className="mt-5 flex items-center justify-center rounded-2xl border border-[#EAE1E4] bg-white py-16 text-sm text-[#6F6066]"><LoaderCircle className="mr-2 size-5 animate-spin text-[#D96C8A]" />Đang tải voucher...</div> : null}
      {error ? <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div> : null}
      {vouchers && !visibleVouchers.length ? <div className="mt-5 rounded-2xl border border-dashed border-[#EAE1E4] bg-white px-5 py-16 text-center"><Tag className="mx-auto size-9 text-[#D96C8A]" /><p className="mt-4 font-extrabold">Chưa có voucher nào</p><p className="mt-2 text-sm text-[#6F6066]">Voucher mới sẽ xuất hiện ở đây khi có ưu đãi dành cho bạn.</p></div> : null}
      {visibleVouchers.length ? <div className="mt-5 grid gap-4">{visibleVouchers.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} />)}</div> : null}
    </div>
  );
}
