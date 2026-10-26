import prisma from "@/lib/db";
import { NextResponse } from "next/server";

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
  return NextResponse.json(dto(settings || {
    onlinePaymentEnabled: false,
    vietQrBankCode: null,
    vietQrAccountNumber: null,
    vietQrAccountName: null,
  }));
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const enabled = body.onlinePaymentEnabled === true;
  const bankCode = String(body.vietQrBankCode || "").trim().toUpperCase();
  const accountNumber = String(body.vietQrAccountNumber || "").trim();
  const accountName = String(body.vietQrAccountName || "").trim().toUpperCase();
  const settings = await prisma.storeSetting.upsert({
    where: { id: 1 },
    create: { id: 1, onlinePaymentEnabled: enabled, vietQrBankCode: bankCode || null, vietQrAccountNumber: accountNumber || null, vietQrAccountName: accountName || null },
    update: { onlinePaymentEnabled: enabled, vietQrBankCode: bankCode || null, vietQrAccountNumber: accountNumber || null, vietQrAccountName: accountName || null },
    select: { onlinePaymentEnabled: true, vietQrBankCode: true, vietQrAccountNumber: true, vietQrAccountName: true },
  });
  return NextResponse.json(dto(settings));
}
