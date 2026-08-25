import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  isDevOtpEnabled,
  OTP_EXPIRES_IN_MINUTES,
} from "@/lib/auth/constants";
import { setAuthCookies } from "@/lib/auth/cookies";
import { generateNumericCode, hashValue } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { sendZaloOtp } from "@/lib/auth/zalo";
import {
  isValidPassword,
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";

export async function POST(req: Request) {
  const body = (await req.json()) as { phone?: string; password?: string };
  const phone = normalizeVietnamesePhone(body.phone?.trim() || "");
  const password = body.password || "";

  if (!phone || !password) {
    return NextResponse.json(
      { message: "Vui lòng nhập số điện thoại và mật khẩu" },
      { status: 400 },
    );
  }

  if (!isValidVietnamesePhone(phone)) {
    return NextResponse.json(
      { message: "Số điện thoại Việt Nam không hợp lệ" },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { message: "Mật khẩu phải có ít nhất 8 ký tự" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { phone } });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.passwordHash ||
    user.passwordHash !== (await hashValue(password))
  ) {
    return NextResponse.json(
      { message: "Số điện thoại hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  if (!user.phoneVerifiedAt) {
    const code = generateNumericCode();

    await prisma.otp.create({
      data: {
        userId: user.id,
        phone,
        codeHash: await hashValue(code),
        purpose: "VERIFY_PHONE",
        expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000),
        userAgent: req.headers.get("user-agent"),
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip"),
      },
    });

    const zalo = await sendZaloOtp(phone, code);
    const payload: {
      requiresPhoneVerification: true;
      message: string;
      zalo: { sent: boolean; skipped: boolean; error?: string };
      devOtp?: string;
    } = {
      requiresPhoneVerification: true,
      message: "Tài khoản chưa xác thực số điện thoại",
      zalo,
    };

    if (!zalo.sent && isDevOtpEnabled()) {
      payload.devOtp = code;
    }

    return NextResponse.json(payload, { status: 202 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  const session = await createSession(
    { id: user.id, phone: user.phone, role: user.role },
    req,
  );
  const response = NextResponse.json({
    accessToken: session.accessToken,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      displayName: user.displayName,
    },
  });

  setAuthCookies(response, session.accessToken, session.refreshToken);

  return response;
}
