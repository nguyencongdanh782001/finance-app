import { NextResponse } from "next/server";
import { getVietQrConfig } from "@/lib/vietqr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { enabled, config } = await getVietQrConfig();
  return NextResponse.json(
    {
      onlinePaymentEnabled: enabled,
      vietQrBankCode: config?.bankCode || null,
      vietQrAccountNumber: config?.accountNumber || null,
      vietQrAccountName: config?.accountName || null,
      vietQrTemplate: config?.template || "compact2",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    },
  );
}
