"use client";

/* eslint-disable @next/next/no-img-element */

import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hook/use-toast";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleHelp,
  Copy,
  Loader2,
  QrCode,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Settings = {
  onlinePaymentEnabled: boolean;
  vietQrBankCode: string;
  vietQrAccountNumber: string;
  vietQrAccountName: string;
};

const empty: Settings = {
  onlinePaymentEnabled: false,
  vietQrBankCode: "",
  vietQrAccountNumber: "",
  vietQrAccountName: "",
};
const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-(--admin-border) bg-white px-3 text-sm text-(--admin-text) outline-none transition focus:border-(--admin-primary) focus:ring-4 focus:ring-(--admin-primary)/10";

function PaymentSettingsSkeleton() {
  return (
    <AdminPageContainer>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <AdminSection className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-[67px] rounded-lg" />
            <Skeleton className="h-[67px] rounded-lg" />
          </div>
          <Skeleton className="h-[67px] rounded-lg" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </AdminSection>
        <div className="space-y-6">
          <AdminSection className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </AdminSection>
          <AdminSection className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </AdminSection>
        </div>
      </div>
    </AdminPageContainer>
  );
}

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/payment")
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải cài đặt thanh toán.");
        setSettings({ ...empty, ...(await response.json()) });
      })
      .catch((error) =>
        toast({
          title: "Không thể tải cài đặt",
          description:
            error instanceof Error ? error.message : "Vui lòng thử lại.",
          variant: "destructive",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/settings/payment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast({
        title: "Chưa lưu được",
        description: data.message || "Vui lòng kiểm tra lại thông tin.",
        variant: "destructive",
      });
      return;
    }
    setSettings({ ...empty, ...data });
    toast({ title: "Đã lưu cài đặt thanh toán", variant: "success" });
  };

  const accountReady = true;
  const enabled = settings.onlinePaymentEnabled;
  const transferContent = "THANH TOAN DON HANG QN-XXXX-XXX";
  const qrPreview = useMemo(() => {
    if (!settings.vietQrBankCode || !settings.vietQrAccountNumber) return "";
    const params = new URLSearchParams({
      amount: "0",
      addInfo: transferContent,
      accountName: settings.vietQrAccountName,
    });
    return `https://img.vietqr.io/image/${encodeURIComponent(settings.vietQrBankCode)}-${encodeURIComponent(settings.vietQrAccountNumber)}-compact2.png?${params.toString()}`;
  }, [
    settings.vietQrAccountName,
    settings.vietQrAccountNumber,
    settings.vietQrBankCode,
  ]);
  const copyContent = async () => {
    await navigator.clipboard.writeText(transferContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (loading) return <PaymentSettingsSkeleton />;

  return (
    <AdminPageContainer>
      <AdminPageHeader
        breadcrumb="Hệ thống"
        title="Cài đặt thanh toán"
        description="Quản lý tài khoản nhận chuyển khoản và cách khách hàng thanh toán online tại checkout."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <AdminSection className="space-y-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--admin-primary-soft) text-(--admin-primary)">
              <WalletCards className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-(--admin-text)">
                Thanh toán VNPAY
              </h2>
              <p className="mt-1 text-sm leading-5 text-(--admin-text-secondary)">
                Khách được chuyển sang cổng VNPAY. VNPAY gửi kết quả giao dịch
                về website để tự động xác nhận đơn.
              </p>
            </div>
            <span
              className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
            >
              <span
                className={`size-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              {enabled ? "Đang bật" : "Đang tắt"}
            </span>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-(--admin-border) bg-(--admin-background) p-4 transition hover:border-(--admin-primary)/40">
            <span className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-(--admin-primary)">
                <CheckCircle2 className="size-4" />
              </span>
              <span>
                <strong className="block text-sm font-semibold text-(--admin-text)">
                  Cho phép thanh toán online
                </strong>
                <span className="mt-1 block text-xs leading-5 text-(--admin-text-secondary)">
                  Hiển thị lựa chọn VNPAY cho khách hàng tại bước thanh toán.
                </span>
              </span>
            </span>
            <span className="relative shrink-0">
              <input
                type="checkbox"
                checked={settings.onlinePaymentEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    onlinePaymentEnabled: event.target.checked,
                  }))
                }
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative block h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-(--admin-primary) peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-(--admin-primary)/20"
              />
            </span>
          </label>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Banknote className="size-4 text-(--admin-primary)" />
              <h3 className="text-sm font-semibold text-(--admin-text)">
                Thông tin tài khoản nhận tiền
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-(--admin-text-secondary)">
                Mã ngân hàng / BIN
                <input
                  value={settings.vietQrBankCode}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      vietQrBankCode: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 970436"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-medium text-(--admin-text-secondary)">
                Số tài khoản
                <input
                  value={settings.vietQrAccountNumber}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      vietQrAccountNumber: event.target.value,
                    }))
                  }
                  placeholder="Nhập số tài khoản nhận tiền"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-(--admin-text-secondary)">
              Tên tài khoản
              <input
                value={settings.vietQrAccountName}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    vietQrAccountName: event.target.value,
                  }))
                }
                placeholder="Ví dụ: NGUYEN VAN A"
                className={inputClass}
              />
            </label>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-(--admin-text-muted)">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
              Thông tin này được dùng để tạo mã QR cho từng đơn hàng, không lưu
              thông tin thẻ.
            </p>
          </div>
          <div className="flex justify-end border-t border-(--admin-border) pt-5">
            <Button
              type="button"
              variant="adminPrimary"
              size="lg"
              onClick={() => void save()}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Đang lưu..." : "Lưu cài đặt"}
              {!saving ? <ArrowRight className="size-4" /> : null}
            </Button>
          </div>
        </AdminSection>
        <div className="space-y-6">
          <AdminSection className="overflow-hidden p-0">
            <div className="border-b border-(--admin-border) px-5 py-4">
              <div className="flex items-center gap-2">
                <QrCode className="size-4 text-(--admin-primary)" />
                <h2 className="text-sm font-semibold text-(--admin-text)">
                  Cấu hình VNPAY
                </h2>
              </div>
              <p className="mt-1 text-xs text-(--admin-text-secondary)">
                Thông tin merchant VNPAY được cấu hình bằng biến môi trường trên server.
              </p>
            </div>
            <div className="p-5">
              {qrPreview ? (
                <div className="rounded-xl border border-(--admin-border) bg-(--admin-background) p-4">
                  <img
                    src={qrPreview}
                    alt="Cấu hình VNPAY"
                    className="mx-auto size-44 rounded-lg bg-white object-contain"
                  />
                  <p className="mt-3 text-center text-xs font-medium text-(--admin-text-secondary)">
                    {settings.vietQrAccountName || "Chưa có tên tài khoản"}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-(--admin-border) bg-(--admin-background) px-5 text-center">
                  <QrCode className="size-9 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-(--admin-text-secondary)">
                    Chưa có dữ liệu QR
                  </p>
                  <p className="mt-1 text-xs leading-5 text-(--admin-text-muted)">
                    Hãy khai báo VNPAY_TMN_CODE và VNPAY_HASH_SECRET rồi bật thanh toán online.
                  </p>
                </div>
              )}
            </div>
          </AdminSection>
          <AdminSection>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--admin-primary-soft) text-(--admin-primary)">
                <CircleHelp className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-(--admin-text)">
                  Quy trình xác nhận
                </h2>
                <ol className="mt-3 space-y-3 text-xs leading-5 text-(--admin-text-secondary)">
                  <li className="flex gap-2">
                    <span className="font-bold text-(--admin-primary)">01</span>
                    Khách chọn VNPAY tại checkout.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-(--admin-primary)">02</span>
                    VNPAY xử lý giao dịch và trả kết quả về website.
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-(--admin-primary)">03</span>
                    Backend xác thực chữ ký IPN rồi tự động xác nhận đơn.
                  </li>
                </ol>
                <button
                  type="button"
                  onClick={() => void copyContent()}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-(--admin-primary) hover:underline"
                >
                  <Copy className="size-3.5" />
                  {copied ? "Đã sao chép" : "Sao chép mẫu nội dung"}
                </button>
              </div>
            </div>
          </AdminSection>
        </div>
      </div>
    </AdminPageContainer>
  );
}
