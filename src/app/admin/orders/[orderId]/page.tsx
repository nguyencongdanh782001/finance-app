"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Order = {
  orderNumber: string;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  receiverName: string | null;
  receiverPhone: string | null;
  receiverAddress: string | null;
  receiverWard: string | null;
  receiverDistrict: string | null;
  receiverProvince: string | null;
  placedAt: string;
  items: Array<{
    productTitle: string;
    productImageUrl: string | null;
    sku: string | null;
    color: string | null;
    size: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch(`/api/admin/orders/${params.orderId}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrder(data);
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error ? cause.message : "Không thể tải đơn hàng.",
        ),
      );
  }, [params.orderId]);

  if (error)
    return (
      <main className="p-6 text-sm font-medium text-rose-600">{error}</main>
    );
  if (!order)
    return (
      <main className="flex min-h-96 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );

  const address = [
    order.receiverAddress,
    order.receiverWard,
    order.receiverDistrict,
    order.receiverProvince,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--admin-text-muted)">
            Chi tiết đơn hàng
          </p>
          <h1 className="text-xl font-extrabold text-(--admin-text)">
            {order.orderNumber}
          </h1>
        </div>
      </div>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="rounded-xl border border-(--admin-border) bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-bold text-(--admin-text)">Sản phẩm</h2>
          <div className="mt-3 divide-y divide-(--admin-border)">
            {order.items.map((item, index) => (
              <div
                key={`${item.sku}-${index}`}
                className="flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-(--admin-surface)">
                  <Package className="size-5 text-(--admin-text-muted)" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-(--admin-text)">
                    {item.productTitle}
                  </p>
                  <p className="mt-1 text-xs text-(--admin-text-secondary)">
                    {[item.color, item.size, item.sku]
                      .filter(Boolean)
                      .join(" · ") || "Sản phẩm"}
                  </p>
                  <p className="mt-1 text-xs text-(--admin-text-muted)">
                    {item.quantity} × {money(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-(--admin-text)">
                  {money(item.totalPrice)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-(--admin-border) bg-white p-4 shadow-sm sm:p-5">
            <h2 className="font-bold text-(--admin-text)">Trạng thái</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-(--admin-text-muted)">Đơn hàng</p>
                <p className="mt-1 font-semibold">{order.status}</p>
              </div>
              <div>
                <p className="text-xs text-(--admin-text-muted)">Thanh toán</p>
                <p className="mt-1 font-semibold">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-(--admin-border) bg-white p-4 shadow-sm sm:p-5">
            <h2 className="font-bold text-(--admin-text)">Khách hàng</h2>
            <p className="mt-3 text-sm font-semibold">
              {order.receiverName || "Khách lẻ"}
            </p>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              {order.receiverPhone}
            </p>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              {address}
            </p>
          </div>
          <div className="rounded-xl border border-(--admin-border) bg-white p-4 shadow-sm sm:p-5">
            <div className="flex justify-between text-sm text-(--admin-text-secondary)">
              <span>Tạm tính</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-(--admin-text-secondary)">
              <span>Giảm giá</span>
              <span>-{money(order.discountAmount)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-(--admin-text-secondary)">
              <span>Phí giao hàng</span>
              <span>{money(order.shippingFee)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-(--admin-border) pt-3 font-extrabold">
              <span>Tổng cộng</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
