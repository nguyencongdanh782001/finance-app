"use client";

import {
  InvoiceDocument,
  type InvoiceView,
} from "@/components/Invoice/InvoiceDocument";
import { AdminSelect } from "@/components/Admin/AdminFields";
import { Button } from "@/components/ui/button";
import { toast } from "@/hook/use-toast";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Loader2,
  Printer,
  RotateCcw,
  ShieldX,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminInvoicePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [invoice, setInvoice] = useState<InvoiceView | null>(null);
  const [paper, setPaper] = useState<"A4" | "80mm">("A4");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/invoice/preview`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể tải hóa đơn.");
      setInvoice(data);
    } catch (error) {
      toast({
        title:
          error instanceof Error ? error.message : "Không thể tải hóa đơn.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [orderId]);

  const issue = async (reissueReason?: string) => {
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/invoice/issue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reissueReason }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể phát hành hóa đơn.");
      setInvoice(data);
      toast({ title: "Đã phát hành hóa đơn." });
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "Không thể phát hành hóa đơn.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const voidCurrent = async () => {
    if (!invoice?.id || !voidReason.trim())
      return toast({
        title: "Vui lòng nhập lý do hủy hóa đơn.",
        variant: "destructive",
      });
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "void", reason: voidReason }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể hủy hóa đơn.");
      setInvoice(data);
      setVoidReason("");
      toast({ title: "Đã hủy hóa đơn." });
    } catch (error) {
      toast({
        title:
          error instanceof Error ? error.message : "Không thể hủy hóa đơn.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <main className="admin-page-container p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-[700px] rounded-xl bg-slate-100" />
        </div>
      </main>
    );
  if (!invoice) return null;

  return (
    <main className="invoice-print-shell min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Quay lại quản trị
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36">
              <AdminSelect
                name="invoice-paper"
                value={paper}
                options={[
                  { value: "A4", label: "Khổ A4" },
                  { value: "80mm", label: "Khổ 80mm" },
                ]}
                placeholder="Chọn khổ giấy"
                onChange={(value) => setPaper(value as "A4" | "80mm")}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              In / Lưu PDF
            </Button>
            {invoice.publicUrl ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void navigator.clipboard.writeText(invoice.publicUrl || "")
                }
              >
                <Copy className="size-4" />
                Sao chép link
              </Button>
            ) : null}
            {invoice.publicUrl ? (
              <Button asChild variant="ghost">
                <a href={invoice.publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Mở công khai
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Hóa đơn nội bộ cửa hàng
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {invoice.invoiceNumber || `Đơn ${invoice.order.orderNumber}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status === "DRAFT" ? (
              <Button disabled={busy} onClick={() => void issue()}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}Xuất
                hóa đơn
              </Button>
            ) : null}
            {invoice.status === "VOIDED" ? (
              <Button
                disabled={busy}
                onClick={() =>
                  void issue("Phát hành lại theo yêu cầu quản trị")
                }
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCcw className="size-4" />
                )}
                Phát hành phiên bản mới
              </Button>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center overflow-auto print:overflow-visible">
          <InvoiceDocument invoice={invoice} paper={paper} />
        </div>
        {invoice.status === "ISSUED" ? (
          <section className="mx-auto mt-5 max-w-[800px] rounded-xl border border-rose-100 bg-white p-4 print:hidden">
            <p className="flex items-center gap-2 text-sm font-bold text-rose-700">
              <ShieldX className="size-4" />
              Hủy hóa đơn
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={voidReason}
                onChange={(event) => setVoidReason(event.target.value)}
                placeholder="Lý do hủy hóa đơn *"
                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
              />
              <Button
                type="button"
                variant="adminDanger"
                disabled={busy || !voidReason.trim()}
                onClick={() => void voidCurrent()}
              >
                Hủy hóa đơn
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
