import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isDevOtpEnabled, OTP_EXPIRES_IN_MINUTES } from "@/lib/auth/constants";
import { generateNumericCode, hashValue } from "@/lib/auth/crypto";
import { isValidEmail, normalizeEmail, sendGmailOtp } from "@/lib/auth/email";
import {
  isValidPassword,
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    phone?: string;
    email?: string;
    password?: string;
    displayName?: string;
    birthday?: string;
    gender?: "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";
  };
  const phone = normalizeVietnamesePhone(body.phone?.trim() || "");
  const email = normalizeEmail(body.email || "");
  const password = body.password || "";
  const displayName = body.displayName?.trim() || "";
  const birthday = body.birthday ? new Date(body.birthday) : null;
  const gender = body.gender;
  const allowedGenders = ["FEMALE", "MALE", "OTHER", "UNSPECIFIED"];

  if (!displayName || !email || !password || !body.birthday || !gender) {
    return NextResponse.json(
      {
        message:
          "Vui lòng nhập đầy đủ tên hiển thị, email, mật khẩu, ngày sinh và giới tính",
      },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "Email không hợp lệ" },
      { status: 400 },
    );
  }

  if (phone && !isValidVietnamesePhone(phone)) {
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

  if (!birthday || Number.isNaN(birthday.getTime())) {
    return NextResponse.json(
      { message: "Ngày sinh không hợp lệ" },
      { status: 400 },
    );
  }

  if (birthday > new Date()) {
    return NextResponse.json(
      { message: "Ngày sinh không được lớn hơn ngày hiện tại" },
      { status: 400 },
    );
  }

  if (!allowedGenders.includes(gender)) {
    return NextResponse.json(
      { message: "Giới tính không hợp lệ" },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser?.emailVerifiedAt && existingUser.passwordHash) {
    return NextResponse.json(
      { message: "Email này đã được đăng ký" },
      { status: 409 },
    );
  }

  if (existingUser?.authProvider === "GOOGLE" && !existingUser.passwordHash) {
    return NextResponse.json(
      { message: "Email này đang đăng nhập bằng Google" },
      { status: 409 },
    );
  }

  const passwordHash = await hashValue(password);
  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          phone: phone || existingUser.phone,
          email,
          authProvider: "WEB",
          displayName,
          firstName: null,
          lastName: null,
          birthday,
          gender,
          status: "ACTIVE",
        },
      })
    : await prisma.user.create({
        data: {
          phone: phone || null,
          email,
          passwordHash,
          authProvider: "WEB",
          role: "CUSTOMER",
          displayName,
          birthday,
          gender,
        },
      });
  const code = generateNumericCode();

  await prisma.otp.create({
    data: {
      userId: user.id,
      phone: phone || null,
      email,
      codeHash: await hashValue(code),
      purpose: "REGISTER",
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000),
      userAgent: req.headers.get("user-agent"),
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip"),
    },
  });

  const emailDelivery = await sendGmailOtp(email, code);
  const payload: {
    success: boolean;
    email: { sent: boolean; skipped: boolean; error?: string };
    devOtp?: string;
  } = {
    success: true,
    email: emailDelivery,
  };

  if (!emailDelivery.sent && isDevOtpEnabled()) {
    payload.devOtp = code;
  }

  return NextResponse.json(payload);
}
