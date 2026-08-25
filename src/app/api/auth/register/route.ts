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
  const body = (await req.json()) as {
    phone?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    birthday?: string;
    gender?: "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";
  };
  const phone = normalizeVietnamesePhone(body.phone?.trim() || "");
  const password = body.password || "";
  const firstName = body.firstName?.trim() || "";
  const lastName = body.lastName?.trim() || "";
  const displayName = [lastName, firstName].filter(Boolean).join(" ");
  const birthday = body.birthday ? new Date(body.birthday) : null;
  const gender = body.gender;
  const allowedGenders = ["FEMALE", "MALE", "OTHER", "UNSPECIFIED"];

  if (!firstName || !lastName || !phone || !password || !body.birthday || !gender) {
    return NextResponse.json(
      {
        message:
          "Vui lòng nhập đầy đủ họ, tên, số điện thoại, mật khẩu, ngày sinh và giới tính",
      },
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

  const existingUser = await prisma.user.findUnique({ where: { phone } });

  if (existingUser?.phoneVerifiedAt && existingUser.passwordHash) {
    return NextResponse.json(
      { message: "Số điện thoại này đã được đăng ký" },
      { status: 409 },
    );
  }

  const passwordHash = await hashValue(password);

  if (existingUser?.phoneVerifiedAt && !existingUser.passwordHash) {
    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        displayName,
        firstName,
        lastName,
        birthday,
        gender,
        status: "ACTIVE",
        lastLoginAt: new Date(),
      },
    });
    const session = await createSession(
      { id: user.id, phone: user.phone, role: user.role },
      req,
    );
    const response = NextResponse.json({
      success: true,
      alreadyVerified: true,
      accessToken: session.accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        displayName: user.displayName,
      },
      zalo: { sent: false, skipped: true },
    });

    setAuthCookies(response, session.accessToken, session.refreshToken);

    return response;
  }

  const user =
    existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            displayName,
            firstName,
            lastName,
            birthday,
            gender,
            status: "ACTIVE",
          },
        })
      : await prisma.user.create({
          data: {
            phone,
            passwordHash,
            role: "CUSTOMER",
            displayName,
            firstName,
            lastName,
            birthday,
            gender,
          },
        });
  const code = generateNumericCode();

  await prisma.otp.create({
    data: {
      userId: user.id,
      phone,
      codeHash: await hashValue(code),
      purpose: "REGISTER",
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000),
      userAgent: req.headers.get("user-agent"),
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip"),
    },
  });

  const zalo = await sendZaloOtp(phone, code);
  const payload: {
    success: boolean;
    zalo: { sent: boolean; skipped: boolean; error?: string };
    devOtp?: string;
  } = {
    success: true,
    zalo,
  };

  if (!zalo.sent && isDevOtpEnabled()) {
    payload.devOtp = code;
  }

  return NextResponse.json(payload);
}
