import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { getDiscountStatus, normalizeDiscountCode } from "@/lib/discounts";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    getAdminFromRequest(request);
    const id = Number((await context.params).id);
    const body = (await request.json()) as Record<string, unknown>;
    const coupon = await prisma.coupon.update({ where: { id }, data: {
      name: body.name === undefined ? undefined : String(body.name).trim(),
      description: body.description === undefined ? undefined : String(body.description || "").trim() || null,
      normalizedCode: body.code === undefined ? undefined : normalizeDiscountCode(String(body.code)),
      code: body.code === undefined ? undefined : normalizeDiscountCode(String(body.code)),
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    } });
    return NextResponse.json({ ...coupon, status: getDiscountStatus(coupon) });
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Không thể cập nhật mã." }, { status: 400 }); }
}
