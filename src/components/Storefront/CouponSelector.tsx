"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Tag } from "lucide-react";
import QrScanner from "qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderValue?: number;
  estimatedDiscount: number;
  expiresAt?: string;
  applicable: boolean;
  unavailableReasonText?: string;
  isBestChoice: boolean;
  isSelected: boolean;
};
type CouponResponse = { available: Coupon[]; unavailable: Coupon[] };

const cache = new Map<string, { at: number; data: CouponResponse }>();
const money = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Không thời hạn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: string;
  selectedCode: string;
  onApply: (code: string) => Promise<boolean>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

function CouponCard({
  coupon,
  selected,
  onSelect,
}: {
  coupon: Coupon;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!coupon.applicable}
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] ${selected ? "border-[#D96C8A] bg-[#FFF4F7]" : "border-[#EAE1E4] bg-white hover:border-[#D96C8A]"} ${!coupon.applicable ? "cursor-not-allowed opacity-65" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FCEEF3] text-[#D96C8A]">
          <Tag className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="line-clamp-2 text-sm text-[#2D2226]">
              {coupon.title}
            </strong>
            {coupon.isBestChoice && coupon.applicable ? (
              <small className="rounded-full bg-[#FCEEF3] px-2 py-0.5 text-[10px] font-bold text-[#A43E5F]">
                Tiết kiệm nhiều nhất
              </small>
            ) : null}
          </span>
          <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-[#A43E5F]">
            {coupon.code}
          </span>
          <span className="mt-1 block text-xs text-[#6F6066]">
            {coupon.minimumOrderValue
              ? `Đơn tối thiểu ${money(coupon.minimumOrderValue)}`
              : "Áp dụng cho đơn hàng"}{" "}
            · Hết hạn: {date(coupon.expiresAt)}
          </span>
          {coupon.applicable ? (
            <span className="mt-1 block text-xs font-bold text-[#3F8F6B]">
              Bạn tiết kiệm {money(coupon.estimatedDiscount)}
            </span>
          ) : (
            <span className="mt-1 block text-xs font-semibold text-[#C94F62]">
              {coupon.unavailableReasonText}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#D96C8A]" : "border-[#CDBFC4]"}`}
        >
          {selected ? (
            <span className="size-2.5 rounded-full bg-[#D96C8A]" />
          ) : null}
        </span>
      </div>
    </button>
  );
}

export default function CouponSelector({
  open,
  onOpenChange,
  intent,
  selectedCode,
  onApply,
  triggerRef,
}: Props) {
  const [data, setData] = useState<CouponResponse | null>(null);
  const [draft, setDraft] = useState(selectedCode);
  const [manual, setManual] = useState("");
  const [unavailableOpen, setUnavailableOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;
    let cancelled = false;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (cancelled) return;
        const raw = typeof result === "string" ? result : result.data;
        const token = raw.match(/\/voucher\/([^/?#]+)/)?.[1];
        setScannerOpen(false);
        if (token) {
          void fetch(`/api/vouchers/${token}`)
            .then(async (response) => {
              const value = await response.json();
              if (!response.ok || !value.code)
                throw new Error("Voucher không hợp lệ.");
              setManual(value.code);
              setError("Đã nhận voucher từ QR. Nhấn Áp dụng để kiểm tra.");
            })
            .catch(() =>
              setError(
                "Không thể đọc voucher từ QR. Vui lòng nhập mã thủ công.",
              ),
            );
        } else {
          setManual(raw.trim());
          setError("Đã nhận mã QR. Nhấn Áp dụng để kiểm tra.");
        }
      },
      { highlightScanRegion: true, highlightCodeOutline: true },
    );
    void scanner
      .start()
      .catch(() =>
        setError("Không thể sử dụng camera. Vui lòng nhập mã thủ công."),
      );
    return () => {
      cancelled = true;
      scanner.stop();
      scanner.destroy();
    };
  }, [scannerOpen]);

  useEffect(() => {
    if (!open) return;
    setDraft(selectedCode);
    setManual("");
    setError("");
    const key = `customer-coupons:${intent}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < 60_000) {
      setData(cached.data);
      return;
    }
    setLoading(true);
    fetch(
      `/api/customer/coupons?checkoutSessionId=${encodeURIComponent(intent)}&couponCode=${encodeURIComponent(selectedCode)}`,
    )
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok)
          throw new Error(value.message || "Không thể tải mã giảm giá.");
        const next = {
          available: value.available || [],
          unavailable: value.unavailable || [],
        } as CouponResponse;
        cache.set(key, { at: Date.now(), data: next });
        setData(next);
      })
      .catch((cause) =>
        setError(
          cause instanceof Error ? cause.message : "Không thể tải mã giảm giá.",
        ),
      )
      .finally(() => setLoading(false));
  }, [intent, open, selectedCode]);

  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  const selectedCoupon = useMemo(
    () =>
      [...(data?.available || []), ...(data?.unavailable || [])].find(
        (item) => item.code === draft,
      ),
    [data, draft],
  );
  const selectAndApply = async (nextDraft = draft) => {
    if (applying || (!nextDraft && !selectedCode)) return;
    setApplying(true);
    setError("");
    const ok = await onApply(nextDraft);
    setApplying(false);
    if (ok) onOpenChange(false);
  };
  const applyManual = () => {
    const code = manual.trim().toUpperCase().replace(/\s+/g, "");
    if (!code) return;
    setDraft(code);
    setError("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="top-auto bottom-0 max-h-[90dvh] max-w-[560px] translate-y-0 rounded-t-2xl rounded-b-none p-0 sm:top-1/2 sm:bottom-auto sm:translate-y-[-50%] sm:rounded-2xl sm:p-0">
          <DialogHeader className="border-b border-[#EAE1E4] px-5 pb-4 pt-5 text-left">
            <DialogTitle>Chọn mã giảm giá</DialogTitle>
            <DialogDescription>
              Chọn ưu đãi phù hợp cho đơn hàng của bạn
            </DialogDescription>
          </DialogHeader>
          <div
            className="max-h-[calc(90dvh-150px)] overflow-y-auto px-5 py-4"
            aria-busy={loading}
          >
            <div className="flex gap-2">
              <Input
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyManual();
                  }
                }}
                placeholder="Nhập mã giảm giá"
                className="h-11 uppercase"
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="h-11 shrink-0 rounded-xl border border-[#EAE1E4] px-3 text-sm font-bold text-[#A43E5F]"
              >
                Quét mã
              </button>
              <button
                type="button"
                onClick={applyManual}
                disabled={!manual.trim()}
                className="h-11 shrink-0 rounded-xl bg-[#D96C8A] px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                Áp dụng
              </button>
            </div>
            {error ? (
              <p
                role="alert"
                className="mt-2 text-sm font-semibold text-[#C94F62]"
              >
                {error}
              </p>
            ) : null}
            {loading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : null}
            {!loading && data?.available.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#FFF8FA] p-4 text-sm text-[#6F6066]">
                Chưa có mã nào phù hợp với đơn hàng này.
                <br />
                Bạn vẫn có thể nhập mã giảm giá ở trên.
              </p>
            ) : null}
            {!loading && data?.available.length ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-extrabold">Có thể sử dụng</p>
                {data.available.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    selected={draft === coupon.code}
                    onSelect={() => setDraft(coupon.code)}
                  />
                ))}
              </div>
            ) : null}
            {!loading && data?.unavailable.length ? (
              <div className="mt-5 border-t border-[#EAE1E4] pt-4">
                <button
                  type="button"
                  onClick={() => setUnavailableOpen((value) => !value)}
                  className="flex w-full items-center justify-between text-sm font-extrabold"
                >
                  Chưa đủ điều kiện ({data.unavailable.length})
                  {unavailableOpen ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </button>
                {unavailableOpen ? (
                  <div className="mt-3 space-y-3">
                    {data.unavailable.map((coupon) => (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        selected={false}
                        onSelect={() => undefined}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#EAE1E4] bg-white px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            {selectedCoupon ? (
              <p className="min-w-0 truncate text-xs text-[#6F6066]">
                Đang chọn{" "}
                <strong className="text-[#A43E5F]">
                  {selectedCoupon.code}
                </strong>
              </p>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  void selectAndApply("");
                }}
                disabled={!selectedCode || applying}
                className="h-11 rounded-xl border border-[#EAE1E4] px-4 text-sm font-bold text-[#6F6066] disabled:opacity-50"
              >
                Bỏ mã
              </button>
              <button
                type="button"
                onClick={() => void selectAndApply()}
                disabled={
                  !draft ||
                  applying ||
                  Boolean(selectedCoupon && !selectedCoupon.applicable)
                }
                className="flex h-11 items-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {applying ? <Loader2 className="size-4 animate-spin" /> : null}
                {applying ? "Đang áp dụng..." : "Áp dụng"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {scannerOpen ? (
        <div className="fixed inset-0 z-[calc(var(--z-dialog)+2)] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between">
              <strong>Quét mã QR</strong>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                aria-label="Đóng quét QR"
                className="p-2 text-[#6F6066]"
              >
                ×
              </button>
            </div>
            <video
              ref={videoRef}
              className="mt-3 aspect-square w-full rounded-xl bg-black object-cover"
              muted
              playsInline
            />
            <p className="mt-3 text-center text-xs text-[#6F6066]">
              Đưa mã QR vào khung hình
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
