import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    getAdminFromRequest(request);
    const id = Number((await context.params).id);
    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.level !== undefined) data.level = Math.max(0, Math.round(Number(body.level)));
    if (body.minSpendAmount !== undefined) data.minSpendAmount = Math.max(0, Math.round(Number(body.minSpendAmount)));
    if (body.discountRate !== undefined) data.discountRate = Math.min(100, Math.max(0, Math.round(Number(body.discountRate))));
    if (body.birthdayMaxDiscountAmount !== undefined) data.birthdayMaxDiscountAmount = body.birthdayMaxDiscountAmount ? Math.max(0, Math.round(Number(body.birthdayMaxDiscountAmount))) : null;
    if (body.isActive !== undefined) data.isActive = body.isActive === true;
    if (data.name === "") throw new Error("Tên hạng membership không được để trống.");
    const membership = await prisma.membership.update({ where: { id }, data });
    return NextResponse.json(membership);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Không thể cập nhật hạng membership." }, { status: 400 });
  }
}
