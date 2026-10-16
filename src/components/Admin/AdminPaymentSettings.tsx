"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hook/use-toast";
import { CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/payment")
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải cài đặt thanh toán.");
        const data = await response.json();
        setSettings({ ...empty, ...data });
      })
      .catch((error) => toast({ title: "Lỗi", description: error.message, variant: "destructive" }))
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
      toast({ title: "Chưa lưu được", description: data.message || "Vui lòng thử lại.", variant: "destructive" });
      return;
    }
    setSettings({ ...empty, ...data });
    toast({ title: "Đã lưu cài đặt thanh toán" });
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Đang tải cài đặt...</div>;
  return (
    <div className="max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-primary" />
          <h1 className="text-xl font-bold text-slate-900">Thanh toán VietQR</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">Khi tắt, khách hàng sẽ không nhìn thấy lựa chọn thanh toán online tại checkout.</p>
      </div>
      <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4">
          <span>
            <strong className="block text-sm text-slate-900">Cho phép thanh toán online</strong>
            <span className="mt-1 block text-xs text-slate-500">Hiển thị VietQR cho khách hàng.</span>
          </span>
          <input type="checkbox" checked={settings.onlinePaymentEnabled} onChange={(event) => setSettings((current) => ({ ...current, onlinePaymentEnabled: event.target.checked }))} className="size-5 accent-primary" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Mã ngân hàng<input value={settings.vietQrBankCode} onChange={(event) => setSettings((current) => ({ ...current, vietQrBankCode: event.target.value }))} placeholder="MB, VCB, ACB..." className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-slate-700">Số tài khoản<input value={settings.vietQrAccountNumber} onChange={(event) => setSettings((current) => ({ ...current, vietQrAccountNumber: event.target.value }))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" /></label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">Tên tài khoản<input value={settings.vietQrAccountName} onChange={(event) => setSettings((current) => ({ ...current, vietQrAccountName: event.target.value }))} placeholder="NGUYEN VAN A" className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" /></label>
        <Button type="button" onClick={() => void save()} disabled={saving}>{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Lưu cài đặt</Button>
      </section>
    </div>
  );
}
