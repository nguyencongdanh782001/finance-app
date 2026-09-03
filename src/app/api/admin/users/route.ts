import { UserRole, UserStatus } from "@/app/generated/prisma/client";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { ensureCurrentMembership } from "@/lib/memberships";
import prisma from "@/lib/db";
import { hashValue } from "@/lib/auth/crypto";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";
import {
  isValidPassword,
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";
import { NextResponse } from "next/server";

const errorResponse = (error: unknown) =>
  NextResponse.json(
    {
      message:
        error instanceof Error ? error.message : "Không thể xử lý người dùng.",
    },
    { status: 400 },
  );

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status");
    const role = url.searchParams.get("role");

    const users = await prisma.user.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { displayName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            }
          : {}),
        ...(Object.values(UserStatus).includes(status as UserStatus)
          ? { status: status as UserStatus }
          : {}),
        ...(Object.values(UserRole).includes(role as UserRole)
          ? { role: role as UserRole }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        authProvider: true,
        totalOrders: true,
        totalSpent: true,
        rewardPoints: true,
        createdAt: true,
        membership: {
          select: { id: true, name: true, color: true, discountRate: true },
        },
      },
    });

    const currentMemberships = await Promise.all(
      users
        .filter(
          (user) =>
            user.role === UserRole.CUSTOMER &&
            user.status === UserStatus.ACTIVE,
        )
        .map(async (user) => {
          const membership = (await ensureCurrentMembership(user.id))
            .membership;
          return [
            user.id,
            membership
              ? {
                  name: membership.name,
                  color: membership.color,
                  discountRate: Number(membership.discountRate),
                }
              : null,
          ] as const;
        }),
    );
    const membershipByUserId = new Map(currentMemberships);

    return NextResponse.json(
      users.map((user) => ({
        ...user,
        totalSpent: Number(user.totalSpent),
        membership: membershipByUserId.has(user.id)
          ? membershipByUserId.get(user.id)
          : user.membership
            ? {
                ...user.membership,
                discountRate: Number(user.membership.discountRate),
              }
            : null,
      })),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const body = (await request.json()) as {
      id?: number;
      status?: UserStatus;
      role?: UserRole;
    };
    const id = Number(body.id);
    const hasStatus = body.status !== undefined;
    const hasRole = body.role !== undefined;
    if (!Number.isInteger(id) || (!hasStatus && !hasRole)) {
      return NextResponse.json(
        { message: "Thông tin cập nhật không hợp lệ." },
        { status: 400 },
      );
    }
    if (
      hasStatus &&
      !Object.values(UserStatus).includes(body.status as UserStatus)
    ) {
      return NextResponse.json(
        { message: "Trạng thái không hợp lệ." },
        { status: 400 },
      );
    }
    if (
      hasRole &&
      body.role !== UserRole.ADMIN &&
      body.role !== UserRole.CUSTOMER
    ) {
      return NextResponse.json(
        { message: "Role không hợp lệ." },
        { status: 400 },
      );
    }
    if (id === admin.userId && hasStatus && body.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { message: "Không thể khóa tài khoản đang đăng nhập." },
        { status: 400 },
      );
    }
    if (id === admin.userId && hasRole) {
      return NextResponse.json(
        { message: "Không thể tự thay đổi role tài khoản đang đăng nhập." },
        { status: 400 },
      );
    }
    if (
      hasRole &&
      admin.role !== UserRole.SUPER_ADMIN &&
      body.role !== UserRole.CUSTOMER
    ) {
      return NextResponse.json(
        { message: "Chỉ Super Admin mới được cấp role quản trị." },
        { status: 403 },
      );
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(hasStatus ? { status: body.status } : {}),
        ...(hasRole ? { role: body.role } : {}),
      },
      select: { id: true, displayName: true, status: true, role: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const body = (await request.json()) as {
      displayName?: string;
      phone?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    };
    const displayName = body.displayName?.trim() || "";
    const phone = normalizeVietnamesePhone(body.phone?.trim() || "");
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    const role = body.role as UserRole;

    if (!displayName || !phone || !email || !password || !role) {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập đầy đủ tên, số điện thoại, email, mật khẩu và role.",
        },
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
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 8 ký tự." },
        { status: 400 },
      );
    }
    if (role !== UserRole.ADMIN && role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { message: "Role không hợp lệ." },
        { status: 400 },
      );
    }
    if (admin.role !== UserRole.SUPER_ADMIN && role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { message: "Chỉ Super Admin mới được cấp role quản trị." },
        { status: 403 },
      );
    }

    const duplicate = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
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

    const user = await prisma.user.create({
      data: {
        displayName,
        phone,
        email,
        passwordHash: await hashValue(password),
        authProvider: "WEB",
        role,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        displayName: true,
        phone: true,
        email: true,
        role: true,
        status: true,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
