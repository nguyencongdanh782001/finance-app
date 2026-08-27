"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import type {
  DailySoldProductGroup,
  DailySoldProductSale,
  SoldProductSourceValue,
} from "@/interface/financeAPI";
import { ChevronDown, ImageOff } from "lucide-react";

const SOURCE_LABELS: Record<SoldProductSourceValue, string> = {
  OFFLINE: "Tại shop",
  ONLINE: "Online",
  LEGACY_MANUAL: "Dữ liệu cũ",
};

const SOURCE_STYLES: Record<SoldProductSourceValue, string> = {
  OFFLINE: "bg-blue-50 text-blue-700",
  ONLINE: "bg-indigo-50 text-indigo-700",
  LEGACY_MANUAL: "bg-slate-100 text-slate-600",
};

const formatMoney = (value: number) => `${formatCurrencyVND(value)}đ`;

const getProfitClassName = (value: number | null) =>
  (value ?? 0) < 0 ? "text-red-600" : "text-emerald-700";

const formatOptionalMoney = (value: number | null) =>
  value === null ? "-" : formatMoney(value);

const formatTime = (value: string, includeDate = false) =>
  new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    ...(includeDate ? { day: "2-digit", month: "2-digit" } : {}),
  });

export const getPriceRangeLabel = (group: DailySoldProductGroup) =>
  group.minUnitPrice === group.maxUnitPrice
    ? formatMoney(group.minUnitPrice)
    : `${formatMoney(group.minUnitPrice)} - ${formatMoney(group.maxUnitPrice)}`;

function ProductImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title: string;
}) {
  if (!imageUrl) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <ImageOff className="size-4" />
      </span>
    );
  }

  return (
    <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={title} className="size-full object-cover" />
    </span>
  );
}

function SourceBadge({ source }: { source: SoldProductSourceValue }) {
  return (
    <span
      className={`inline-flex w-fit whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold ${SOURCE_STYLES[source]}`}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}

function SaleDesktopRow({ sale }: { sale: DailySoldProductSale }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(98px,1.2fr)_72px_minmax(76px,0.75fr)_40px_78px_86px_86px_50px] items-center gap-2 border-t border-slate-100 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-700">
          {sale.variantName ?? "Không phân loại"}
        </p>
        {sale.sku ? (
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
            SKU: {sale.sku}
          </p>
        ) : null}
      </div>
      <SourceBadge source={sale.source} />
      <span className="truncate font-bold text-slate-600">
        {sale.orderCode ?? "-"}
      </span>
      <span className="text-right font-extrabold text-slate-700">
        {sale.quantity}
      </span>
      <span className="whitespace-nowrap text-right font-bold text-slate-700">
        {formatMoney(sale.unitPrice)}
      </span>
      <span className="whitespace-nowrap text-right font-extrabold text-slate-800">
        {formatMoney(sale.totalAmount)}
      </span>
      <span
        className={`whitespace-nowrap text-right font-extrabold ${getProfitClassName(sale.profit)}`}
      >
        {formatOptionalMoney(sale.profit)}
      </span>
      <span className="whitespace-nowrap text-right text-xs font-semibold text-slate-400">
        {formatTime(sale.soldAt)}
      </span>
    </div>
  );
}

function SaleCompactRow({ sale }: { sale: DailySoldProductSale }) {
  return (
    <div className="border-t border-slate-100 px-4 py-3 first:border-t-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-700">
            {sale.variantName ?? "Không phân loại"}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
            <SourceBadge source={sale.source} />
            <span className="truncate">
              {sale.orderCode ?? "Không có mã đơn"}
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">
              {formatTime(sale.soldAt, true)}
            </span>
          </div>
        </div>
        {sale.sku ? (
          <span className="max-w-24 truncate text-xs font-bold text-slate-400">
            {sale.sku}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="whitespace-nowrap font-bold text-slate-600">
          {sale.quantity} × {formatMoney(sale.unitPrice)}
        </span>
        <span className="whitespace-nowrap font-extrabold text-slate-800">
          {formatMoney(sale.totalAmount)}
        </span>
      </div>
      <p
        className={`mt-1 text-right text-xs font-bold ${getProfitClassName(sale.profit)}`}
      >
        Lợi nhuận: {formatOptionalMoney(sale.profit)}
      </p>
    </div>
  );
}

export function SoldProductGroupRow({
  group,
  open,
  onOpenChange,
}: {
  group: DailySoldProductGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const priceLabel = getPriceRangeLabel(group);

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <article
        className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-150 ${
          open ? "border-blue-200" : "border-slate-100 hover:border-slate-200"
        }`}
      >
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="group h-auto w-full min-w-0 justify-start rounded-none px-4 py-3 text-left hover:bg-slate-50 focus-visible:z-10 focus-visible:ring-blue-2/30"
            aria-label={`${open ? "Thu gọn" : "Mở rộng"} ${group.productName}`}
          >
            <div className="flex w-full min-w-0 items-center gap-3 sm:hidden">
              <ProductImage
                imageUrl={group.imageUrl}
                title={group.productName}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-800">
                  {group.productName}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  Đã bán {group.totalQuantity.toLocaleString("vi-VN")} ·{" "}
                  {group.saleCount.toLocaleString("vi-VN")} lượt bán
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                  Giá: {priceLabel}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm font-extrabold">
                  <span className="whitespace-nowrap text-blue-2">
                    Tổng: {formatMoney(group.totalAmount)}
                  </span>
                  <span className={getProfitClassName(group.totalProfit)}>
                    LN: {formatOptionalMoney(group.totalProfit)}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`size-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-blue-2" : ""}`}
              />
            </div>

            <div className="hidden w-full min-w-0 grid-cols-[minmax(0,1fr)_72px_112px_28px] items-center gap-3 sm:grid lg:grid-cols-[minmax(0,1.5fr)_64px_66px_118px_100px_100px_28px]">
              <div className="flex min-w-0 items-center gap-3">
                <ProductImage
                  imageUrl={group.imageUrl}
                  title={group.productName}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {group.productName}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-400 lg:hidden">
                    {group.saleCount} lượt · {priceLabel} · LN:{" "}
                    {formatOptionalMoney(group.totalProfit)}
                  </p>
                  <p className="mt-1 hidden truncate text-xs font-semibold text-slate-400 lg:block">
                    {group.categoryName ?? "Không phân loại"}
                    {group.variantCount > 1
                      ? ` · ${group.variantCount} phân loại`
                      : ""}
                  </p>
                </div>
              </div>
              <span className="whitespace-nowrap text-right text-sm font-extrabold text-slate-700">
                {group.totalQuantity.toLocaleString("vi-VN")}
              </span>
              <span className="hidden whitespace-nowrap text-right text-sm font-bold text-slate-500 lg:block">
                {group.saleCount.toLocaleString("vi-VN")}
              </span>
              <span className="hidden whitespace-nowrap text-right text-xs font-bold text-slate-600 lg:block">
                {priceLabel}
              </span>
              <span className="whitespace-nowrap text-right text-sm font-extrabold text-blue-2">
                {formatMoney(group.totalAmount)}
              </span>
              <span
                className={`hidden whitespace-nowrap text-right text-sm font-extrabold lg:block ${getProfitClassName(group.totalProfit)}`}
              >
                {formatOptionalMoney(group.totalProfit)}
              </span>
              <ChevronDown
                className={`size-5 shrink-0 justify-self-end text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-blue-2" : ""}`}
              />
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="duration-150">
          <div className="border-t border-slate-100 bg-slate-50/70">
            <div className="hidden grid-cols-[minmax(98px,1.2fr)_72px_minmax(76px,0.75fr)_40px_78px_86px_86px_50px] gap-2 px-4 py-2.5 text-[10px] font-extrabold uppercase text-slate-400 lg:grid">
              <span>Phân loại</span>
              <span>Nguồn</span>
              <span>Đơn hàng</span>
              <span className="text-right">SL</span>
              <span className="text-right">Giá bán</span>
              <span className="text-right">Thành tiền</span>
              <span className="text-right">Lợi nhuận</span>
              <span className="text-right">Giờ</span>
            </div>
            <div className="hidden lg:block">
              {group.sales.map((sale) => (
                <SaleDesktopRow key={sale.id} sale={sale} />
              ))}
            </div>
            <div className="lg:hidden">
              {group.sales.map((sale) => (
                <SaleCompactRow key={sale.id} sale={sale} />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-2 border-t border-slate-200 px-4 py-3 text-xs font-bold text-slate-500">
              <span>Tổng:</span>
              <span>
                {group.totalQuantity.toLocaleString("vi-VN")} sản phẩm
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap text-blue-2">
                {formatMoney(group.totalAmount)}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`whitespace-nowrap ${getProfitClassName(group.totalProfit)}`}
              >
                Lợi nhuận {formatOptionalMoney(group.totalProfit)}
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </article>
    </Collapsible>
  );
}
