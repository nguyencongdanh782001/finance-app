import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { hashValue } from "@/lib/auth/crypto";
import { isValidPassword } from "@/lib/auth/validation";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    getAdminFromRequest(request);
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: "ID người dùng không hợp lệ." }, { status: 400 });
    const body = (await request.json()) as { currentPassword?: unknown; newPassword?: unknown; confirmPassword?: unknown };
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const fieldErrors: Record<string, string> = {};
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, passwordHash: true } });
    if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 });
    if (!currentPassword) fieldErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    else if (!user.passwordHash || user.passwordHash !== (await hashValue(currentPassword))) fieldErrors.currentPassword = "Mật khẩu hiện tại không đúng.";
    if (!newPassword) fieldErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    else if (!isValidPassword(newPassword)) fieldErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (newPassword && newPassword === currentPassword) fieldErrors.newPassword = "Mật khẩu mới không được trùng mật khẩu hiện tại.";
    if (newPassword !== confirmPassword) fieldErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    if (Object.keys(fieldErrors).length) return NextResponse.json({ message: "Vui lòng kiểm tra lại thông tin mật khẩu.", fieldErrors }, { status: 400 });

    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { passwordHash: await hashValue(newPassword) } }),
      prisma.userSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return NextResponse.json({ message: "Đã đổi mật khẩu thành công." });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Không thể đổi mật khẩu." }, { status: 400 });
  }
}

