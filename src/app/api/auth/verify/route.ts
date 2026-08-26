import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MAX_OTP_ATTEMPTS } from "@/lib/auth/constants";
import { setAuthCookies } from "@/lib/auth/cookies";
import { hashValue } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    code?: string;
    purpose?: "LOGIN" | "REGISTER";
  };
  const email = normalizeEmail(body.email || "");
  const code = body.code?.trim();
  const purpose = body.purpose || "REGISTER";

  if (purpose !== "REGISTER" && purpose !== "LOGIN") {
    return NextResponse.json(
      { message: "OTP chỉ được dùng để xác thực email" },
      { status: 400 },
    );
  }

  if (!email || !code) {
    return NextResponse.json(
      { message: "Vui lòng nhập email và mã OTP" },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "Email không hợp lệ" },
      { status: 400 },
    );
  }

  const otp = await prisma.otp.findFirst({
    where: {
      email,
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

    return NextResponse.json({ message: "Mã OTP không đúng" }, { status: 400 });
  }

  const user =
    otp.user ||
    (await prisma.user.upsert({
      where: { email },
      update: {
        authProvider: "WEB",
        role: "CUSTOMER",
        status: "ACTIVE",
      },
      create: {
        email,
        authProvider: "WEB",
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
        emailVerifiedAt: user.emailVerifiedAt || new Date(),
        lastLoginAt: new Date(),
      },
    }),
  ]);

  const session = await createSession(
    { id: user.id, phone: user.phone, email: user.email, role: user.role },
    req,
  );
  const response = NextResponse.json({
    accessToken: session.accessToken,
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      authProvider: user.authProvider,
    },
  });

  setAuthCookies(response, session.accessToken, session.refreshToken);

  return response;
}
