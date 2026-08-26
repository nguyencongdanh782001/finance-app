import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isDevOtpEnabled, OTP_EXPIRES_IN_MINUTES } from "@/lib/auth/constants";
import { generateNumericCode, hashValue } from "@/lib/auth/crypto";
import { isValidEmail, normalizeEmail, sendGmailOtp } from "@/lib/auth/email";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = normalizeEmail(body.email || "");

  if (!email) {
    return NextResponse.json(
      { message: "Vui lòng nhập email" },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "Email không hợp lệ" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({
      message: "Nếu email tồn tại, mã xác thực sẽ được gửi đến email này",
    });
  }

  if (user.authProvider === "GOOGLE" && !user.passwordHash) {
    return NextResponse.json(
      { message: "Tài khoản này đang đăng nhập bằng Google" },
      { status: 409 },
    );
  }

  const code = generateNumericCode();

  await prisma.otp.create({
    data: {
      userId: user.id,
      email,
      phone: user.phone,
      codeHash: await hashValue(code),
      purpose: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000),
      userAgent: req.headers.get("user-agent"),
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip"),
    },
  });

  const emailDelivery = await sendGmailOtp(email, code);
  const payload: {
    success: true;
    message: string;
    email: { sent: boolean; skipped: boolean; error?: string };
    devOtp?: string;
  } = {
    success: true,
    message: "Nếu email tồn tại, mã xác thực sẽ được gửi đến email này",
    email: emailDelivery,
  };

  if (!emailDelivery.sent && isDevOtpEnabled()) {
    payload.devOtp = code;
  }

  return NextResponse.json(payload);
}
