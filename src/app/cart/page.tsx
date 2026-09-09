"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import {
  useCart,
  type StorefrontCartItem,
} from "@/components/Storefront/CartProvider";

const money = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;

function QuantityControl({
  item,
  available,
  onUpdate,
  compact = false,
  pending = false,
}: {
  item: StorefrontCartItem;
  available: boolean;
  onUpdate: (quantity: number) => void;
  compact?: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-md border border-[#D8CDD1] bg-white shadow-[0_1px_0_rgba(45,34,38,0.02)] ${compact ? "h-8" : "h-10"}`}
    >
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={pending || item.quantity <= 1}
        onClick={() => onUpdate(item.quantity - 1)}
        className={`flex h-full items-center justify-center text-[#8B7A80] transition hover:text-[#A43E5F] disabled:opacity-35 ${compact ? "w-7" : "w-9"}`}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={`text-center text-xs font-bold text-[#2D2226] ${compact ? "w-7" : "w-8"}`}
      >
        {item.quantity}
      </span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        disabled={pending || !available || item.quantity >= item.stock}
        onClick={() => onUpdate(item.quantity + 1)}
        className={`flex h-full items-center justify-center text-[#8B7A80] transition hover:text-[#A43E5F] disabled:opacity-35 ${compact ? "w-7" : "w-9"}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function CartItemRow({
  item,
  selected,
  onSelect,
  onRemove,
  onUpdate,
  pending,
}: {
  item: StorefrontCartItem;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (quantity: number) => void;
  pending: boolean;
}) {
  const available = item.isEligible !== false && item.stock >= item.quantity;
  const unavailableMessage =
    item.status !== "PUBLIC"
      ? "Sản phẩm không còn khả dụng"
      : item.stock
        ? `Chỉ còn ${item.stock} sản phẩm`
        : "Hết hàng";
  const productHref = `/products/${item.slug || item.productId}`;

  return (
    <article
      aria-busy={pending}
      className={`group relative grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-[#EAE1E4] px-3 py-5 last:border-b-0 sm:grid-cols-[104px_minmax(0,1fr)] sm:px-5 sm:py-6 lg:grid-cols-[32px_112px_minmax(0,1fr)_112px_120px_128px_40px] lg:items-center lg:gap-4 lg:px-4 lg:py-7 ${selected ? "bg-[#FFF9FB] after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-[#D96C8A]" : "hover:bg-[#FDFBFB]"}`}
    >
      <label
        className="absolute left-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-[0_2px_8px_rgba(45,34,38,0.12)] lg:static lg:ml-[-6px] lg:rounded-none lg:bg-transparent lg:shadow-none"
        aria-label={`Chọn ${item.title}`}
      >
        <input
          type="checkbox"
          checked={selected}
          disabled={!available}
          onChange={onSelect}
          className="size-4 accent-[#D96C8A]"
        />
      </label>
      <Link
        href={productHref}
        className="block aspect-[3/4] overflow-hidden rounded-[10px] bg-[#F5EEF0]"
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="relative min-w-0">
        <div className="relative pr-8">
          <Link
            href={productHref}
            className="line-clamp-2 text-sm font-bold leading-[1.35] text-[#2D2226] hover:text-[#A43E5F] sm:text-[15px]"
          >
            {item.title}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Xóa ${item.title}`}
            className="absolute -right-2 -top-2 flex size-8 items-center justify-center text-[#998B91] transition hover:text-[#C84F64] lg:hidden"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <p className="mt-1.5 truncate text-[11px] text-[#786A70] sm:text-xs">
          {item.variantLabel || "Biến thể"}
          {item.sku ? ` · SKU: ${item.sku}` : ""}
        </p>
        <div className="mt-2 flex items-center gap-2 lg:hidden">
          <span className="text-sm font-bold text-[#2D2226]">
            {money(item.price)}
          </span>
          {item.comparePrice ? (
            <del className="text-xs text-[#998B91]">
              {money(item.comparePrice)}
            </del>
          ) : null}
        </div>
        {!available ? (
          <p className="mt-2 text-xs font-semibold text-[#C84F64]">
            {unavailableMessage}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
          <QuantityControl
            item={item}
            available={available}
            onUpdate={onUpdate}
            compact
            pending={pending}
          />
          <div className="text-right">
            <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-[#998B91]">
              {pending ? "Đang lưu..." : "Thành tiền"}
            </span>
            <strong className="block text-base font-extrabold text-[#A43E5F]">
              {money(item.price * item.quantity)}
            </strong>
          </div>
        </div>
      </div>
      <div className="hidden text-sm text-[#2D2226] lg:block">
        <span>{money(item.price)}</span>
        {item.comparePrice ? (
          <del className="mt-1 block text-xs text-[#998B91]">
            {money(item.comparePrice)}
          </del>
        ) : null}
      </div>
      <div className="hidden lg:block">
        <QuantityControl
          item={item}
          available={available}
          onUpdate={onUpdate}
          pending={pending}
        />
      </div>
      <strong className="hidden text-sm font-extrabold text-[#A43E5F] lg:block">
        {money(item.price * item.quantity)}
      </strong>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Xóa ${item.title}`}
        className="hidden size-10 items-center justify-center text-[#998B91] transition hover:text-[#C84F64] lg:flex"
      >
        <Trash2 className="size-4" />
      </button>
    </article>
  );
}

function OrderSummary({
  count,
  total,
  error,
  onCheckout,
}: {
  count: number;
  total: number;
  error: string;
  onCheckout: () => void;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-[#E6DDE0] border-t-2 border-t-[#D96C8A] bg-white p-5 shadow-[0_12px_36px_rgba(83,45,58,0.06)] sm:p-6 lg:sticky lg:top-24">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D96C8A]">
        Đơn hàng của bạn
      </p>
      <h2 className="mt-2 text-xl font-extrabold text-[#2D2226]">
        Tóm tắt đơn hàng
      </h2>
      <dl className="mt-5 space-y-3 text-sm text-[#6F6066]">
        <div className="flex justify-between gap-4">
          <dt>Đã chọn</dt>
          <dd className="font-bold text-[#2D2226]">{count} sản phẩm</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Tạm tính</dt>
          <dd className="font-bold text-[#2D2226]">{money(total)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Phí vận chuyển</dt>
          <dd className="text-right">Tính khi thanh toán</dd>
        </div>
      </dl>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#EAE1E4] pt-4">
        <span className="font-bold text-[#2D2226]">Tổng dự kiến</span>
        <span className="text-xl font-extrabold text-[#A43E5F]">
          {money(total)}
        </span>
      </div>
      {error ? (
        <p className="mt-3 text-xs font-semibold text-[#C84F64]">{error}</p>
      ) : null}
      <button
        type="button"
        disabled={!count}
        onClick={onCheckout}
        className="mt-5 flex h-12 w-full items-center justify-between rounded-lg bg-[#D96C8A] px-4 text-sm font-bold text-white transition hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span>Thanh toán</span>
        <span>{money(total)}</span>
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-[#998B91]">
        Bạn có thể kiểm tra lại thông tin trước khi đặt hàng.
      </p>
    </aside>
  );
}

export default function CartPage() {
  const { items, update, remove, isLoading } = useCart();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const eligible = useMemo(
    () =>
      items.filter(
        (item) => item.isEligible !== false && item.stock >= item.quantity,
      ),
    [items],
  );
  useEffect(() => {
    setSelected((current) => {
      if (initialized)
        return new Set(
          [...current].filter((id) => eligible.some((item) => item.id === id)),
        );
      if (!items.length) return current;
      setInitialized(true);
      return new Set(eligible.map((item) => item.id));
    });
  }, [eligible, initialized, items.length]);
  const selectedItems = items.filter(
    (item) =>
      selected.has(item.id) &&
      item.isEligible !== false &&
      item.stock >= item.quantity,
  );
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const allSelected =
    eligible.length > 0 && eligible.every((item) => selected.has(item.id));
  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(eligible.map((item) => item.id)),
    );
  const deleteItem = async (item: StorefrontCartItem) => {
    if (!window.confirm(`Xóa “${item.title}” khỏi giỏ hàng?`)) return;
    await remove(item.key);
    setSelected((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
  };
  const deleteSelected = async () => {
    if (
      !selectedItems.length ||
      !window.confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)
    )
      return;
    await Promise.all(selectedItems.map((item) => remove(item.key)));
    setSelected(new Set());
  };
  const updateItem = async (key: string, quantity: number) => {
    setUpdatingKey(key);
    try {
      await update(key, quantity);
    } finally {
      setUpdatingKey(null);
    }
  };
  const checkout = async () => {
    setError("");
    if (!selectedItems.length)
      return setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
    const response = await fetch("/api/checkout/cart-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItemIds: selectedItems.map((item) => item.id),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      return setError(data.message || "Không thể tạo phiên thanh toán.");
    window.location.assign(
      `/checkout?intent=${encodeURIComponent(data.token)}`,
    );
  };
  if (isLoading)
    return (
      <StorefrontShell>
        <main className="pb-24">
          <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
            <div className="storefront-skeleton h-4 w-24" />
            <div className="storefront-skeleton mt-5 h-9 w-40" />
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-0">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="storefront-skeleton h-36 border-b border-white/50"
                  />
                ))}
              </div>
              <div className="storefront-skeleton h-72 rounded-2xl" />
            </div>
          </div>
        </main>
      </StorefrontShell>
    );
  return (
    <StorefrontShell>
      <main className="pb-32">
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <nav className="text-xs text-[#998B91]">
            <Link href="/" className="hover:text-[#D96C8A]">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>Giỏ hàng
          </nav>
          <div className="mt-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#D96C8A]">
                Your selection
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-none tracking-[-0.03em] text-[#2D2226] sm:text-5xl">
                Giỏ hàng
              </h1>
              <p className="mt-3 text-sm text-[#6F6066]">
                {items.length} sản phẩm trong giỏ hàng
              </p>
            </div>
            {items.length ? (
              <span className="hidden rounded-full bg-[#FCEEF3] px-3 py-1.5 text-xs font-bold text-[#A43E5F] sm:inline-flex">
                {selectedItems.length} đã chọn
              </span>
            ) : null}
          </div>
          {items.length ? (
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-16">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E6DDE0] bg-white shadow-[0_8px_28px_rgba(83,45,58,0.035)]">
                <div className="flex min-h-14 items-center justify-between border-b border-[#DED3D7] px-4 text-sm sm:px-5">
                  <label className="-ml-2 flex min-h-10 items-center gap-2 px-2 font-semibold text-[#2D2226]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(element) => {
                        if (element)
                          element.indeterminate =
                            !allSelected && selected.size > 0;
                      }}
                      onChange={toggleAll}
                      disabled={!eligible.length}
                      className="size-4 accent-[#D96C8A]"
                    />
                    <span>Chọn tất cả</span>
                    <span className="hidden font-normal text-[#998B91] sm:inline">
                      ({eligible.length} sản phẩm khả dụng)
                    </span>
                  </label>
                  {selectedItems.length ? (
                    <button
                      type="button"
                      onClick={() => void deleteSelected()}
                      className="text-xs font-bold text-[#C84F64] transition hover:text-[#A43E5F]"
                    >
                      Xóa mục đã chọn
                    </button>
                  ) : null}
                </div>
                <div className="hidden grid-cols-[32px_112px_minmax(0,1fr)_112px_120px_128px_40px] items-center gap-4 border-b border-[#EAE1E4] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#998B91] lg:grid">
                  <span />
                  <span>Ảnh</span>
                  <span>Sản phẩm</span>
                  <span>Đơn giá</span>
                  <span>Số lượng</span>
                  <span>Thành tiền</span>
                  <span />
                </div>
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    pending={updatingKey === item.key}
                    onSelect={() =>
                      setSelected((current) => {
                        const next = new Set(current);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      })
                    }
                    onRemove={() => void deleteItem(item)}
                    onUpdate={(quantity) => void updateItem(item.key, quantity)}
                  />
                ))}
              </section>
              <div className="hidden lg:block">
                <OrderSummary
                  count={selectedItems.length}
                  total={total}
                  error={error}
                  onCheckout={() => void checkout()}
                />
              </div>
            </div>
          ) : (
            <div className="mt-10 py-20 text-center">
              <ShoppingBag className="mx-auto size-9 text-[#D96C8A]" />
              <h2 className="mt-4 text-xl font-extrabold text-[#2D2226]">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="mt-2 text-sm text-[#6F6066]">
                Hãy khám phá những sản phẩm phù hợp với phong cách của bạn.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-lg bg-[#D96C8A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#C85B7B]"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>
      </main>
      {items.length ? (
        <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-[#DED3D7] bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(83,45,58,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#2D2226]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                disabled={!eligible.length}
                className="size-4 accent-[#D96C8A]"
              />
              Tất cả
            </label>
            <div className="min-w-0 flex-1 border-l border-[#EAE1E4] pl-3">
              <p className="text-[11px] text-[#998B91]">Tổng thanh toán</p>
              <p className="truncate text-base font-extrabold text-[#A43E5F]">
                {money(total)}
              </p>
            </div>
            <button
              type="button"
              disabled={!selectedItems.length}
              onClick={() => void checkout()}
              className="h-11 shrink-0 rounded-lg bg-[#D96C8A] px-4 text-xs font-bold text-white transition hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Thanh toán
            </button>
          </div>
          {error ? (
            <p className="mx-auto mt-2 max-w-xl text-right text-[11px] font-semibold text-[#C84F64]">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </StorefrontShell>
  );
}
