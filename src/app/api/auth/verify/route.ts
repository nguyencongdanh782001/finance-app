import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MAX_OTP_ATTEMPTS } from "@/lib/auth/constants";
import { setAuthCookies } from "@/lib/auth/cookies";
import { hashValue } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    phone?: string;
    code?: string;
    purpose?: "REGISTER" | "VERIFY_PHONE";
  };
  const phone = normalizeVietnamesePhone(body.phone?.trim() || "");
  const code = body.code?.trim();
  const purpose = body.purpose || "REGISTER";

  if (purpose !== "REGISTER" && purpose !== "VERIFY_PHONE") {
    return NextResponse.json(
      { message: "OTP chỉ được dùng để xác thực số điện thoại" },
      { status: 400 },
    );
  }

  if (!phone || !code) {
    return NextResponse.json(
      { message: "Vui lòng nhập số điện thoại và mã OTP" },
      { status: 400 },
    );
  }

  if (!isValidVietnamesePhone(phone)) {
    return NextResponse.json(
      { message: "Số điện thoại Việt Nam không hợp lệ" },
      { status: 400 },
    );
  }

  const otp = await prisma.otp.findFirst({
    where: {
      phone,
      purpose,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
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

    return NextResponse.json(
      { message: "Mã OTP không đúng" },
      { status: 400 },
    );
  }

  const user =
    otp.user ||
    (await prisma.user.upsert({
      where: { phone },
      update: {
        role: "CUSTOMER",
        status: "ACTIVE",
      },
      create: {
        phone,
        role: "CUSTOMER",
      },
    }));

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "Tài khoản chưa được kích hoạt" },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerifiedAt: user.phoneVerifiedAt || new Date(),
        lastLoginAt: new Date(),
      },
    }),
  ]);

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
