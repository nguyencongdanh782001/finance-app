import { hashValue } from "@/lib/auth/crypto";
import { isValidPassword } from "@/lib/auth/validation";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER") return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  try {
    const body = (await request.json()) as { currentPassword?: unknown; newPassword?: unknown; confirmPassword?: unknown };
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) return NextResponse.json({ message: "Không tìm thấy tài khoản." }, { status: 404 });
    const fieldErrors: Record<string, string> = {};
    if (user.passwordHash && (!currentPassword || user.passwordHash !== (await hashValue(currentPassword)))) fieldErrors.currentPassword = "Mật khẩu hiện tại không đúng.";
    if (!newPassword) fieldErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    else if (!isValidPassword(newPassword)) fieldErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (newPassword && newPassword === currentPassword) fieldErrors.newPassword = "Mật khẩu mới không được trùng mật khẩu hiện tại.";
    if (newPassword !== confirmPassword) fieldErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    if (Object.keys(fieldErrors).length) return NextResponse.json({ message: "Vui lòng kiểm tra lại thông tin mật khẩu.", fieldErrors }, { status: 422 });
    await prisma.$transaction([prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashValue(newPassword) } }), prisma.userSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })]);
    return NextResponse.json({ message: "Đã đổi mật khẩu thành công." });
  } catch { return NextResponse.json({ message: "Không thể đổi mật khẩu lúc này." }, { status: 400 }); }
}
