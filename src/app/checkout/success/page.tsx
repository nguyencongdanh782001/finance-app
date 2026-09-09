import Link from "next/link";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-[#FAF8F8] px-4"><div className="w-full max-w-md bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-extrabold text-[#398866]">Đặt hàng thành công</h1><p className="mt-3 text-sm text-[#6F6066]">Mã đơn hàng: <strong>{order || "—"}</strong></p><Link href="/products" className="mt-7 inline-flex bg-[#D96C8A] px-5 py-3 text-sm font-bold text-white">Tiếp tục mua sắm</Link></div></main>;
}
