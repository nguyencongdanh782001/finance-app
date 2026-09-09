"use client";

/* eslint-disable @next/next/no-img-element */

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export type InvoiceView = {
  id?: number;
  invoiceNumber: string | null;
  version?: number;
  status: "DRAFT" | "ISSUED" | "VOIDED";
  publicUrl?: string | null;
  order: {
    id?: number;
    orderNumber: string;
    source: string;
    status: string;
    placedAt: string | Date;
  };
  seller: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    logoUrl?: string | null;
    taxCode?: string | null;
    footerNote?: string | null;
    returnPolicy?: string | null;
  };
  customer: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  items: Array<{
    index: number;
    productName: string;
    variantName?: string | null;
    colorName?: string | null;
    sizeName?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: number;
    lineDiscount: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  note?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  issuedAt?: string | Date | null;
  voidReason?: string | null;
};

export const money = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;
const sourceLabel: Record<string, string> = {
  OFFLINE: "Tại shop",
  ONLINE: "Online",
};
const paymentLabel: Record<string, string> = {
  CASH: "Tiền mặt",
  COD: "COD",
  CARD: "Thẻ",
  BANK_TRANSFER: "Chuyển khoản",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
};
const paymentStatusLabel: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  REFUNDED: "Đã hoàn tiền",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
};

export function InvoiceDocument({
  invoice,
  paper = "A4",
}: {
  invoice: InvoiceView;
  paper?: "A4" | "80mm";
}) {
  const isThermal = paper === "80mm";
  const [qrDataUrl, setQrDataUrl] = useState("");
  useEffect(() => {
    if (!invoice.publicUrl || invoice.status !== "ISSUED") {
      setQrDataUrl("");
      return;
    }
    void QRCode.toDataURL(invoice.publicUrl, { margin: 2, width: 150 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [invoice.publicUrl, invoice.status]);
  return (
    <article
      className={`invoice-document mx-auto bg-white text-[#262124] ${isThermal ? "invoice-thermal w-[80mm] p-3 text-[11px]" : "invoice-a4 min-h-[297mm] max-w-[210mm] p-8 text-sm sm:p-12"}`}
    >
      {invoice.status === "VOIDED" ? (
        <div className="invoice-watermark">ĐÃ HỦY</div>
      ) : null}
      <header
        className={`${isThermal ? "text-center" : "flex items-start justify-between gap-8 border-b-2 border-[#D96C8A] pb-5"}`}
      >
        <div className={isThermal ? "" : "min-w-0"}>
          {invoice.seller.logoUrl && !isThermal ? (
            <img
              src={invoice.seller.logoUrl}
              alt=""
              className="mb-3 h-10 max-w-36 object-contain object-left"
            />
          ) : null}
          <p className="text-base font-extrabold uppercase tracking-[0.08em]">
            {invoice.seller.name || "Quỳnh Nhi Store"}
          </p>
          <p className="mt-1 text-lg font-bold text-[#A43E5F]">
            PHIẾU BÁN HÀNG
          </p>
          {invoice.seller.address ? (
            <p className="mt-2 text-xs leading-5 text-[#66595E]">
              {invoice.seller.address}
            </p>
          ) : null}
          {invoice.seller.phone || invoice.seller.email ? (
            <p className="text-xs text-[#66595E]">
              {[invoice.seller.phone, invoice.seller.email]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>
        <div
          className={`${isThermal ? "mt-3 border-y border-dashed border-slate-300 py-2 text-left" : "shrink-0 text-right text-xs"}`}
        >
          <p>
            Số:{" "}
            <strong>
              {invoice.invoiceNumber || "Số hóa đơn sẽ được tạo khi phát hành"}
            </strong>
          </p>
          <p className="mt-1">
            Ngày:{" "}
            {new Date(
              invoice.issuedAt || invoice.order.placedAt,
            ).toLocaleDateString("vi-VN")}
          </p>
          <p className="mt-1">Đơn hàng: {invoice.order.orderNumber}</p>
          <p className="mt-1">
            Nguồn: {sourceLabel[invoice.order.source] || invoice.order.source}
          </p>
        </div>
      </header>

      {invoice.status === "DRAFT" ? (
        <p className="my-4 border border-dashed border-[#D96C8A] bg-[#FFF7F9] px-3 py-2 text-center text-xs font-bold text-[#A43E5F]">
          Bản xem trước – Chưa phát hành
        </p>
      ) : null}
      <section
        className={`${isThermal ? "border-b border-dashed border-slate-300 py-3" : "mt-6 rounded-xl border border-slate-200 p-4"}`}
      >
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#A43E5F]">
          Thông tin khách hàng
        </h2>
        <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          <p>
            Tên: <strong>{invoice.customer.name}</strong>
          </p>
          {invoice.customer.phone ? (
            <p>Số điện thoại: {invoice.customer.phone}</p>
          ) : null}
          {invoice.customer.email ? (
            <p>Email: {invoice.customer.email}</p>
          ) : null}
          {invoice.customer.address ? (
            <p className="sm:col-span-2">Địa chỉ: {invoice.customer.address}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#A43E5F]">
          Danh sách sản phẩm
        </h2>
        {isThermal ? (
          <div className="space-y-3 border-y border-dashed border-slate-300 py-3">
            {invoice.items.map((item) => (
              <div key={item.index}>
                <p className="font-bold">{item.productName}</p>
                <p className="text-slate-600">
                  {[item.colorName, item.sizeName].filter(Boolean).join(" / ")}
                  {item.sku ? ` · ${item.sku}` : ""}
                </p>
                <div className="flex justify-between gap-2">
                  <span>
                    {item.quantity} × {money(item.unitPrice)}
                  </span>
                  <strong>{money(item.lineTotal)}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#FFF7F9]">
                <tr>
                  <th className="w-8 px-2 py-2">STT</th>
                  <th className="px-2 py-2">Sản phẩm</th>
                  <th className="px-2 py-2">Phân loại</th>
                  <th className="w-12 px-2 py-2 text-right">SL</th>
                  <th className="w-24 px-2 py-2 text-right">Đơn giá</th>
                  <th className="w-28 px-2 py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr
                    key={item.index}
                    className="break-inside-avoid border-t border-slate-100"
                  >
                    <td className="px-2 py-2 align-top">{item.index}</td>
                    <td className="px-2 py-2 align-top font-semibold">
                      {item.productName}
                      {item.sku ? (
                        <span className="mt-1 block text-[10px] font-normal text-slate-500">
                          SKU: {item.sku}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 align-top text-slate-600">
                      {item.variantName ||
                        [item.colorName, item.sizeName]
                          .filter(Boolean)
                          .join(" / ") ||
                        "—"}
                    </td>
                    <td className="px-2 py-2 text-right align-top">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-2 text-right align-top">
                      {money(item.unitPrice)}
                    </td>
                    <td className="px-2 py-2 text-right align-top font-bold">
                      {money(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        className={`mt-5 ml-auto ${isThermal ? "w-full border-b border-dashed border-slate-300 pb-3" : "max-w-sm"}`}
      >
        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <span>Tạm tính</span>
            <strong>{money(invoice.subtotal)}</strong>
          </div>
          {invoice.discountAmount > 0 ? (
            <div className="flex justify-between gap-4">
              <span>Giảm giá</span>
              <strong>-{money(invoice.discountAmount)}</strong>
            </div>
          ) : null}
          {invoice.shippingFee > 0 ? (
            <div className="flex justify-between gap-4">
              <span>Phí vận chuyển</span>
              <strong>{money(invoice.shippingFee)}</strong>
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex justify-between gap-4 border-t-2 border-[#D96C8A] pt-3 text-base font-extrabold">
          <span>Tổng thanh toán</span>
          <span className="text-[#A43E5F]">{money(invoice.totalAmount)}</span>
        </div>
      </section>
      <section
        className={`${isThermal ? "mt-3" : "mt-7 border-t border-slate-200 pt-4"} text-xs`}
      >
        <p>
          Phương thức:{" "}
          {paymentLabel[invoice.paymentMethod || ""] ||
            invoice.paymentMethod ||
            "Chưa cập nhật"}
        </p>
        <p className="mt-1">
          Thanh toán:{" "}
          {paymentStatusLabel[invoice.paymentStatus || ""] ||
            invoice.paymentStatus ||
            "Chưa cập nhật"}
        </p>
        {invoice.note ? <p className="mt-3">Ghi chú: {invoice.note}</p> : null}
      </section>
      {!isThermal && invoice.publicUrl ? (
        <div className="mt-8 flex items-end gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Mã QR tra cứu hóa đơn"
              className="size-24"
            />
          ) : null}
          <div>
            <p>Quét để xem hóa đơn</p>
            <p className="mt-1 break-all">{invoice.publicUrl}</p>
          </div>
        </div>
      ) : null}
      <footer className="mt-8 text-center text-xs text-slate-500">
        <p>
          {invoice.seller.footerNote ||
            "Cảm ơn quý khách đã mua hàng tại Quỳnh Nhi Store."}
        </p>
        {invoice.seller.returnPolicy ? (
          <p className="mt-1">{invoice.seller.returnPolicy}</p>
        ) : null}
      </footer>
    </article>
  );
}
