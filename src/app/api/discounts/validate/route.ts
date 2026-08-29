import { validateDiscount } from "@/lib/discounts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; items?: unknown[]; userId?: number };
    const items = Array.isArray(body.items) ? body.items.map((item) => {
      const value = item as Record<string, unknown>;
      return { productId: Number(value.productId), unitPrice: Number(value.unitPrice), quantity: Number(value.quantity) };
    }) : [];
    const result = await validateDiscount(String(body.code || ""), items, undefined, body.userId);
    return NextResponse.json({ valid: true, code: result.code, name: result.coupon.name, type: result.coupon.type, value: Number(result.coupon.value), maxDiscountAmount: result.coupon.maxDiscountAmount ? Number(result.coupon.maxDiscountAmount) : null, subtotal: result.subtotal, discountAmount: result.discountAmount, total: result.total });
  } catch (error) { return NextResponse.json({ valid: false, message: error instanceof Error ? error.message : "Mã giảm giá không hợp lệ." }, { status: 400 }); }
}
