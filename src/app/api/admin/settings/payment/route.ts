import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { getVietQrConfig } from "@/lib/vietqr";

const isAdmin = (request: Request) =>
  ["ADMIN", "SUPER_ADMIN"].includes(request.headers.get("x-user-role") || "");

const dto = (settings: {
  onlinePaymentEnabled: boolean;
  vietQrBankCode: string | null;
  vietQrAccountNumber: string | null;
  vietQrAccountName: string | null;
}) => settings;

export async function GET(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const settings = await prisma.storeSetting.findUnique({
    where: { id: 1 },
    select: { onlinePaymentEnabled: true, vietQrBankCode: true, vietQrAccountNumber: true, vietQrAccountName: true },
  });
  const envConfig = await getVietQrConfig();
  return NextResponse.json(dto(settings || {
    onlinePaymentEnabled: false,
    vietQrBankCode: envConfig.config?.bankCode || null,
    vietQrAccountNumber: envConfig.config?.accountNumber || null,
    vietQrAccountName: envConfig.config?.accountName || null,
  }));
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const enabled = body.onlinePaymentEnabled === true;
  const bankCode = String(body.vietQrBankCode || "").trim().toUpperCase();
  const accountNumber = String(body.vietQrAccountNumber || "").trim();
  const accountName = String(body.vietQrAccountName || "").trim().toUpperCase();
  if (enabled && (!bankCode || !accountNumber || !accountName)) {
    return NextResponse.json(
      { message: "Vui lòng nhập đầy đủ ngân hàng, số tài khoản và tên tài khoản VietQR." },
      { status: 422 },
    );
  }
  const settings = await prisma.storeSetting.upsert({
    where: { id: 1 },
    create: { id: 1, onlinePaymentEnabled: enabled, vietQrBankCode: bankCode || null, vietQrAccountNumber: accountNumber || null, vietQrAccountName: accountName || null },
    update: { onlinePaymentEnabled: enabled, vietQrBankCode: bankCode || null, vietQrAccountNumber: accountNumber || null, vietQrAccountName: accountName || null },
    select: { onlinePaymentEnabled: true, vietQrBankCode: true, vietQrAccountNumber: true, vietQrAccountName: true },
  });
  return NextResponse.json(dto(settings));
}
