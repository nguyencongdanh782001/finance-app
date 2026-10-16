import StorefrontShell from "@/components/Storefront/StorefrontShell";
import { ArrowRight, Check, PackageCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; payment?: string; amount?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <StorefrontShell>
      <main className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-[#FCEEF3] blur-3xl"
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#EAE1E4] bg-white shadow-[0_24px_70px_rgba(77,47,58,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
            <section className="p-6 sm:p-10 lg:p-14">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#E4F5EC] text-[#398866] ring-8 ring-[#F2FBF5]">
                <Check className="size-8 stroke-[2.5]" />
              </div>
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.2em] text-[#D96C8A]">
                Cảm ơn bạn đã mua hàng
              </p>
              <h1 className="mt-3 max-w-md text-3xl font-extrabold leading-tight text-[#2D2226] sm:text-4xl">
                Đặt hàng thành công!
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#6F6066] sm:text-base">
                Đơn hàng của bạn đã được ghi nhận. Quỳnh Nhi Store sẽ sớm liên
                hệ để xác nhận và chuẩn bị sản phẩm cho bạn.
              </p>

              <div className="mt-8 rounded-2xl border border-[#F4D6DF] bg-[#FFF7F9] p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B7A80]">
                  Mã đơn hàng
                </p>
                <p className="mt-2 break-all text-lg font-extrabold tracking-wide text-[#A43E5F] sm:text-xl">
                  {order || "—"}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(217,108,138,0.24)] transition hover:bg-[#C85B7B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] focus-visible:ring-offset-2"
                >
                  <ShoppingBag className="size-4" />
                  Tiếp tục mua sắm
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/account/orders"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#EAE1E4] px-5 text-sm font-extrabold text-[#A43E5F] transition hover:border-[#F4B5C5] hover:bg-[#FFF7F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] focus-visible:ring-offset-2"
                >
                  Xem đơn hàng
                </Link>
              </div>
            </section>

            <aside className="relative overflow-hidden bg-[#F8F1EE] p-6 sm:p-10 lg:p-12">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 size-64 rounded-full border-[24px] border-white/60"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-16 size-56 rounded-full bg-[#FCE0E8]/70"
              />
              <div className="relative flex h-full min-h-72 flex-col justify-between">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#D96C8A] shadow-[0_12px_30px_rgba(77,47,58,0.08)]">
                  <PackageCheck className="size-7" />
                </div>
                <div className="mt-12">
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#A43E5F]">
                    Đơn hàng đang được xử lý
                  </p>
                  <h2 className="mt-3 text-2xl font-extrabold leading-tight text-[#3B2D32]">
                    Một chút háo hức đang được gửi đến bạn.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#6F6066]">
                    Bạn có thể theo dõi đơn hàng trong khu vực tài khoản bất cứ
                    lúc nào.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#398866]">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#E4F5EC]">
                    <Check className="size-4" />
                  </span>
                  Thanh toán an toàn · Giao hàng tận nơi
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
