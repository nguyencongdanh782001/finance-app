import prisma from "@/lib/db";
import {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";
import { NextResponse } from "next/server";

const serialize = (user: {
  id: number;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  birthday: Date | null;
  gender: string | null;
  authProvider: string;
  phoneVerifiedAt: Date | null;
}) => ({ ...user, birthday: user.birthday?.toISOString() ?? null });

export async function GET(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER")
    return NextResponse.json(
      { message: "Phiên đăng nhập không hợp lệ." },
      { status: 401 },
    );
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      email: true,
      firstName: true,
      lastName: true,
      displayName: true,
      avatarUrl: true,
      birthday: true,
      gender: true,
      authProvider: true,
      phoneVerifiedAt: true,
    },
  });
  return user
    ? NextResponse.json(serialize(user))
    : NextResponse.json(
        { message: "Không tìm thấy tài khoản." },
        { status: 404 },
      );
}

export async function PATCH(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER")
    return NextResponse.json(
      { message: "Phiên đăng nhập không hợp lệ." },
      { status: 401 },
    );
  try {
    const body = await request.json();
    const displayName = String(body.displayName ?? "").trim();
    if (!displayName || displayName.length > 120)
      return NextResponse.json(
        { message: "Vui lòng nhập họ và tên hợp lệ." },
        { status: 422 },
      );
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });
    if (!existing)
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản." },
        { status: 404 },
      );
    const requestedPhone =
      body.phone == null
        ? existing.phone || ""
        : normalizeVietnamesePhone(String(body.phone).trim());
    if (!requestedPhone)
      return NextResponse.json(
        {
          message: "Vui lòng nhập số điện thoại.",
          fieldErrors: { phone: "Vui lòng nhập số điện thoại." },
        },
        { status: 422 },
      );
    if (!isValidVietnamesePhone(requestedPhone))
      return NextResponse.json(
        {
          message: "Số điện thoại Việt Nam không hợp lệ.",
          fieldErrors: { phone: "Số điện thoại Việt Nam không hợp lệ." },
        },
        { status: 422 },
      );
    const genderValue = String(body.gender ?? "");
    const validGenders = ["FEMALE", "MALE", "OTHER", "UNSPECIFIED"] as const;
    if (!(validGenders as readonly string[]).includes(genderValue))
      return NextResponse.json(
        {
          message: "Vui lòng chọn giới tính.",
          fieldErrors: { gender: "Vui lòng chọn giới tính." },
        },
        { status: 422 },
      );
    const gender = genderValue as (typeof validGenders)[number];
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: requestedPhone,
        displayName,
        firstName: String(body.firstName ?? displayName)
          .trim()
          .slice(0, 80),
        lastName: String(body.lastName ?? "")
          .trim()
          .slice(0, 80),
        birthday: body.birthday ? new Date(body.birthday) : null,
        gender,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
        birthday: true,
        gender: true,
        authProvider: true,
        phoneVerifiedAt: true,
      },
    });
    return NextResponse.json(serialize(user));
  } catch {
    return NextResponse.json(
      { message: "Không thể cập nhật thông tin lúc này." },
      { status: 400 },
    );
  }
}
