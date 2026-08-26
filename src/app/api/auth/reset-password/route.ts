import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MAX_OTP_ATTEMPTS } from "@/lib/auth/constants";
import { hashValue } from "@/lib/auth/crypto";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";
import { isValidPassword } from "@/lib/auth/validation";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    code?: string;
    password?: string;
  };
  const email = normalizeEmail(body.email || "");
  const code = body.code?.trim() || "";
  const password = body.password || "";

  if (!email || !code || !password) {
    return NextResponse.json(
      { message: "Vui lòng nhập đầy đủ email, mã OTP và mật khẩu mới" },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "Email không hợp lệ" },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { message: "Mật khẩu phải có ít nhất 8 ký tự" },
      { status: 400 },
    );
  }

  const otp = await prisma.otp.findFirst({
    where: {
      email,
      purpose: "RESET_PASSWORD",
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  if (!otp || otp.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "Mã OTP không đúng hoặc đã hết hạn" },
      { status: 400 },
    );
  }

  if (otp.attemptCount >= MAX_OTP_ATTEMPTS) {
    return NextResponse.json(
      { message: "Bạn đã nhập sai OTP quá nhiều lần" },
      { status: 429 },
    );
  }

  if (otp.codeHash !== (await hashValue(code))) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attemptCount: { increment: 1 } },
    });

    return NextResponse.json({ message: "Mã OTP không đúng" }, { status: 400 });
  }

  if (!otp.user || otp.user.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "Tài khoản không hợp lệ" },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: otp.user.id },
      data: {
        passwordHash: await hashValue(password),
        authProvider: "WEB",
        emailVerifiedAt: otp.user.emailVerifiedAt || new Date(),
      },
    }),
    prisma.userSession.updateMany({
      where: { userId: otp.user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
