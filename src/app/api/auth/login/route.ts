import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isDevOtpEnabled, OTP_EXPIRES_IN_MINUTES } from "@/lib/auth/constants";
import { generateNumericCode, hashValue } from "@/lib/auth/crypto";
import { isValidEmail, normalizeEmail, sendGmailOtp } from "@/lib/auth/email";
import { isValidPassword } from "@/lib/auth/validation";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = normalizeEmail(body.email || "");
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Vui lòng nhập email và mật khẩu" },
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

  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    user.authProvider !== "WEB" ||
    !user.passwordHash ||
    user.passwordHash !== (await hashValue(password))
  ) {
    return NextResponse.json(
      { message: "Email hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  const code = generateNumericCode();

  await prisma.otp.create({
    data: {
      userId: user.id,
      email,
      phone: user.phone,
      codeHash: await hashValue(code),
      purpose: "LOGIN",
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000),
      userAgent: req.headers.get("user-agent"),
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip"),
    },
  });

  const emailDelivery = await sendGmailOtp(email, code);
  const payload: {
    requiresEmailVerification: true;
    message: string;
    email: { sent: boolean; skipped: boolean; error?: string };
    devOtp?: string;
  } = {
    requiresEmailVerification: true,
    message: "Vui lòng nhập mã OTP đã gửi qua email",
    email: emailDelivery,
  };

  if (!emailDelivery.sent && isDevOtpEnabled()) {
    payload.devOtp = code;
  }

  return NextResponse.json(payload, { status: 202 });
}
