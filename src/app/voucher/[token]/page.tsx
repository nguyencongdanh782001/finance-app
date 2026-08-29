"use client";

import { useEffect, useState } from "react";

type Voucher = { name: string; description: string | null; code: string; type: string; value: number; minOrderAmount: number | null; endsAt: string | null; status: string };

export default function VoucherPage({ params }: { params: Promise<{ token: string }> }) {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  useEffect(() => { void params.then(({ token }) => fetch(`/api/vouchers/${token}`).then((response) => response.ok ? response.json() : null).then(setVoucher)); }, [params]);
  if (!voucher) return <main className="flex min-h-svh items-center justify-center bg-[#F8F5F6] p-5">Không tìm thấy voucher.</main>;
  return <main className="flex min-h-svh items-center justify-center bg-[#F8F5F6] p-5"><article className="w-full max-w-md rounded-2xl border border-[#EAE1E4] bg-white p-6 text-center shadow-sm"><p className="text-sm font-semibold text-[#D96C8A]">Voucher</p><h1 className="mt-2 text-2xl font-bold text-[#2D2226]">{voucher.name}</h1><p className="mt-4 rounded-xl bg-[#FCEEF3] px-4 py-3 text-xl font-extrabold tracking-widest text-[#A43E5F]">{voucher.code}</p><p className="mt-4 text-[#65545B]">{voucher.type === "PERCENTAGE" ? `Giảm ${voucher.value}%` : `Giảm ${voucher.value.toLocaleString("vi-VN")}đ`}</p>{voucher.minOrderAmount ? <p className="mt-1 text-sm text-[#8B7A80]">Đơn tối thiểu {voucher.minOrderAmount.toLocaleString("vi-VN")}đ</p> : null}<p className="mt-4 text-sm font-semibold text-[#397354]">{voucher.status === "ACTIVE" ? "Đang có hiệu lực" : "Voucher hiện không khả dụng"}</p></article></main>;
}
