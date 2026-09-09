"use client";

import {
  InvoiceDocument,
  type InvoiceView,
} from "@/components/Invoice/InvoiceDocument";
import { Loader2, Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<InvoiceView | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/invoices/public/${token}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setInvoice(data);
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Không tìm thấy hóa đơn.",
        ),
      );
  }, [token]);
  if (error)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Không thể mở hóa đơn</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </main>
    );
  if (!invoice)
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#D96C8A]" />
      </main>
    );
  return (
    <main className="invoice-print-shell min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D96C8A] px-4 py-2 text-sm font-bold text-white"
        >
          <Printer className="size-4" />
          In / Lưu PDF
        </button>
      </div>
      <div className="flex justify-center">
        <InvoiceDocument invoice={invoice} />
      </div>
    </main>
  );
}
