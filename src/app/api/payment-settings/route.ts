import { NextResponse } from "next/server";
import { getVietQrConfig } from "@/lib/vietqr";

export async function GET() {
  const { enabled, config } = await getVietQrConfig();
  return NextResponse.json({
    onlinePaymentEnabled: enabled,
    ...(enabled
      ? {
          vietQrBankCode: config?.bankCode,
          vietQrAccountNumber: config?.accountNumber,
          vietQrAccountName: config?.accountName,
          vietQrTemplate: config?.template,
        }
      : {}),
  });
}
