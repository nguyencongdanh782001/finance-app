import { UserGender, UserStatus } from "@/app/generated/prisma/client";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { ensureCurrentMembership } from "@/lib/memberships";
import { hashValue } from "@/lib/auth/crypto";
import { isValidVietnamesePhone, normalizeVietnamesePhone } from "@/lib/auth/validation";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const responseError = (message: string, status = 400, fieldErrors?: Record<string, string>) =>
  NextResponse.json({ message, ...(fieldErrors ? { fieldErrors } : {}) }, { status });

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  displayName: true,
  avatarUrl: true,
  phone: true,
  email: true,
  role: true,
  status: true,
  authProvider: true,
  gender: true,
  birthday: true,
  totalOrders: true,
  totalSpent: true,
  rewardPoints: true,
  phoneVerifiedAt: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  membershipId: true,
  createdAt: true,
  updatedAt: true,
  membership: { select: { id: true, name: true, color: true, discountRate: true } },
} as const;

async function getUser(id: number) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

function serializeUser(user: NonNullable<Awaited<ReturnType<typeof getUser>>>) {
  return {
    ...user,
    totalSpent: Number(user.totalSpent),
    membership: user.membership
      ? { ...user.membership, discountRate: Number(user.membership.discountRate) }
      : null,
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    getAdminFromRequest(request);
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return responseError("ID người dùng không hợp lệ.", 400);
    const user = await getUser(id);
    if (!user) return responseError("Không tìm thấy người dùng.", 404);

    if (user.role === "CUSTOMER" && user.status === "ACTIVE") await ensureCurrentMembership(id);
    const refreshedUser = await getUser(id);
    return NextResponse.json(serializeUser(refreshedUser || user));
  } catch (error) {
    return responseError(error instanceof Error ? error.message : "Không thể tải thông tin người dùng.");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(request);
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return responseError("ID người dùng không hợp lệ.", 400);
    const current = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!current) return responseError("Không tìm thấy người dùng.", 404);

    const body = (await request.json()) as {
      displayName?: unknown;
      firstName?: unknown;
      lastName?: unknown;
      phone?: unknown;
      birthday?: unknown;
      gender?: unknown;
      avatarUrl?: unknown;
      status?: unknown;
      email?: unknown;
      role?: unknown;
      password?: unknown;
    };

    if (body.email !== undefined || body.role !== undefined || body.password !== undefined) {
      return responseError("Email, role và mật khẩu không được cập nhật tại endpoint này.", 400);
    }

    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const phone = typeof body.phone === "string" ? normalizeVietnamesePhone(body.phone) : "";
    const birthday = body.birthday ? new Date(String(body.birthday)) : null;
    const gender = body.gender === "" || body.gender === null ? null : body.gender;
    const status = body.status;
    const fieldErrors: Record<string, string> = {};

    if (!displayName) fieldErrors.displayName = "Vui lòng nhập họ và tên.";
    if (!phone || !isValidVietnamesePhone(phone)) fieldErrors.phone = "Số điện thoại Việt Nam không hợp lệ.";
    if (body.birthday && Number.isNaN(birthday?.getTime())) fieldErrors.birthday = "Ngày sinh không hợp lệ.";
    if (birthday && birthday > new Date()) fieldErrors.birthday = "Ngày sinh không được lớn hơn hôm nay.";
    if (gender !== null && !Object.values(UserGender).includes(gender as UserGender)) fieldErrors.gender = "Giới tính không hợp lệ.";
    if (status !== undefined && !Object.values(UserStatus).includes(status as UserStatus)) fieldErrors.status = "Trạng thái không hợp lệ.";
    if (Object.keys(fieldErrors).length) return responseError("Vui lòng kiểm tra lại thông tin.", 400, fieldErrors);
    if (id === admin.userId && status !== undefined && status !== UserStatus.ACTIVE) return responseError("Không thể khóa tài khoản đang đăng nhập.", 400, { status: "Không thể khóa tài khoản đang đăng nhập." });

    const duplicate = await prisma.user.findFirst({ where: { phone, NOT: { id } }, select: { id: true } });
    if (duplicate) return responseError("Số điện thoại này đã được sử dụng.", 409, { phone: "Số điện thoại này đã được sử dụng." });

    const updated = await prisma.user.update({
      where: { id },
      data: {
        displayName,
        phone,
        firstName: typeof body.firstName === "string" ? body.firstName.trim() || null : null,
        lastName: typeof body.lastName === "string" ? body.lastName.trim() || null : null,
        birthday,
        gender: gender as UserGender | null,
        avatarUrl: typeof body.avatarUrl === "string" ? body.avatarUrl.trim() || null : null,
        ...(status !== undefined ? { status: status as UserStatus } : {}),
      },
      select: userSelect,
    });
    return NextResponse.json(serializeUser(updated));
  } catch (error) {
    return responseError(error instanceof Error ? error.message : "Không thể cập nhật thông tin người dùng.");
  }
}

