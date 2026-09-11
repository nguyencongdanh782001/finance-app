import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { hashValue } from "@/lib/auth/crypto";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";
import {
  isValidPassword,
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";
import { NextResponse } from "next/server";

const selectProfile = {
  id: true,
  displayName: true,
  phone: true,
  email: true,
  role: true,
  authProvider: true,
} as const;

export async function GET(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: admin.userId },
      select: selectProfile,
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin cá nhân.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const existingUser = await prisma.user.findUniqueOrThrow({
      where: { id: admin.userId },
      select: { email: true, passwordHash: true },
    });
    const body = (await request.json()) as {
      displayName?: string;
      phone?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      currentPassword?: string;
    };
    const displayName = body.displayName?.trim() || "";
    const phone = normalizeVietnamesePhone(body.phone?.trim() || "");
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";
    const currentPassword = body.currentPassword || "";
    const sensitiveChange = email !== (existingUser.email || "") || Boolean(password);

    if (!displayName || !phone || !email) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ tên, số điện thoại và email." },
        { status: 400 },
      );
    }
    if (!isValidVietnamesePhone(phone)) {
      return NextResponse.json(
        { message: "Số điện thoại Việt Nam không hợp lệ." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Email không hợp lệ." },
        { status: 400 },
      );
    }
    if (password && !isValidPassword(password)) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 8 ký tự." },
        { status: 400 },
      );
    }
    if (password && password !== confirmPassword) {
      return NextResponse.json(
        { message: "Mật khẩu xác nhận không khớp.", field: "confirmPassword" },
        { status: 400 },
      );
    }
    if (sensitiveChange) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Vui lòng xác thực bằng mật khẩu hiện tại.", field: "currentPassword" },
          { status: 400 },
        );
      }
      if (!existingUser.passwordHash || existingUser.passwordHash !== (await hashValue(currentPassword))) {
        return NextResponse.json(
          { message: "Mật khẩu hiện tại không đúng.", field: "currentPassword" },
          { status: 400 },
        );
      }
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
        NOT: { id: admin.userId },
      },
      select: { email: true, phone: true },
    });
    if (duplicate?.email === email) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 409 },
      );
    }
    if (duplicate?.phone === phone) {
      return NextResponse.json(
        { message: "Số điện thoại này đã được sử dụng." },
        { status: 409 },
      );
    }

    const user = await prisma.$transaction(async (transaction) => {
      const updatedUser = await transaction.user.update({
        where: { id: admin.userId },
        data: {
          displayName,
          phone,
          email,
          ...(password ? { passwordHash: await hashValue(password) } : {}),
        },
        select: selectProfile,
      });
      if (password) {
        await transaction.userSession.updateMany({
          where: { userId: admin.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return updatedUser;
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật thông tin cá nhân.",
      },
      { status: 400 },
    );
  }
}
