import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const memberships = await prisma.membership.findMany({
      orderBy: [{ priority: "desc" }, { level: "asc" }, { name: "asc" }],
      select: { id: true, name: true, level: true, color: true, isActive: true, minSpendAmount: true, discountRate: true, birthdayMaxDiscountAmount: true },
    });
    return NextResponse.json(memberships);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể tải hạng thành viên." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    getAdminFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name || "").trim();
    const level = Math.round(Number(body.level));
    const minSpendAmount = Math.max(0, Math.round(Number(body.minSpendAmount || 0)));
    const discountRate = Math.min(100, Math.max(0, Math.round(Number(body.discountRate || 0))));
    const birthdayMaxDiscountAmount = body.birthdayMaxDiscountAmount ? Math.max(0, Math.round(Number(body.birthdayMaxDiscountAmount))) : null;
    if (!name) throw new Error("Vui lòng nhập tên hạng membership.");
    if (!Number.isFinite(level) || level < 0) throw new Error("Cấp độ membership không hợp lệ.");
    const membership = await prisma.membership.create({ data: { name, level, minSpendAmount, discountRate, birthdayMaxDiscountAmount, priority: level, isActive: body.isActive !== false } });
    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Không thể tạo hạng membership." }, { status: 400 });
  }
}
