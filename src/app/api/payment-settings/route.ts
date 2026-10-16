import { NextResponse } from "next/server";
import { getVietQrConfig } from "@/lib/vietqr";

export const dynamic = "force-dynamic";

export async function GET() {
  const { enabled, config } = await getVietQrConfig();
  return NextResponse.json(
    {
      onlinePaymentEnabled: enabled,
      ...(enabled
        ? {
            vietQrBankCode: config?.bankCode,
            vietQrAccountNumber: config?.accountNumber,
            vietQrAccountName: config?.accountName,
            vietQrTemplate: config?.template,
          }
        : {}),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
