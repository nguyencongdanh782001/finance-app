import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

const toCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = getAdminFromRequest(request);
    const id = Number((await context.params).id);
    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.code !== undefined) data.code = toCode(String(body.code));
    if (body.description !== undefined)
      data.description = body.description ? String(body.description) : null;
    if (body.terms !== undefined)
      data.terms = body.terms ? String(body.terms) : null;
    if (body.color !== undefined)
      data.color = body.color ? String(body.color) : null;
    if (body.icon !== undefined)
      data.icon = body.icon ? String(body.icon) : null;
    if (body.level !== undefined) {
      const level = Number(body.level);
      if (!Number.isFinite(level) || level < 0)
        throw new Error("Cấp độ membership không hợp lệ.");
      data.level = Math.round(level);
    }
    if (body.minSpendAmount !== undefined) {
      const minSpendAmount = Number(body.minSpendAmount);
      if (!Number.isFinite(minSpendAmount) || minSpendAmount < 0)
        throw new Error("Ngưỡng chi tiêu phải là số không âm.");
      data.minSpendAmount = Math.round(minSpendAmount);
    }
    if (body.discountRate !== undefined) {
      const discountRate = Number(body.discountRate);
      if (
        !Number.isFinite(discountRate) ||
        discountRate < 0 ||
        discountRate > 100
      )
        throw new Error("Tỷ lệ giảm phải từ 0% đến 100%.");
      data.discountRate = Math.round(discountRate);
    }
    if (body.birthdayMaxDiscountAmount !== undefined)
      data.birthdayMaxDiscountAmount = body.birthdayMaxDiscountAmount
        ? Math.max(0, Math.round(Number(body.birthdayMaxDiscountAmount)))
        : null;
    if (body.isActive !== undefined) data.isActive = body.isActive === true;
    if (data.name === "")
      throw new Error("Tên hạng membership không được để trống.");
    if (data.code === "")
      throw new Error("Mã hạng membership không được để trống.");
    const current = await prisma.membership.findUniqueOrThrow({
      where: { id },
      select: {
        minSpendAmount: true,
        isActive: true,
        name: true,
        code: true,
        level: true,
        discountRate: true,
      },
    });
    const minSpendAmount =
      data.minSpendAmount === undefined
        ? Number(current.minSpendAmount)
        : Number(data.minSpendAmount);
    const isActive =
      data.isActive === undefined ? current.isActive : Boolean(data.isActive);
    const activeTiers = await prisma.membership.findMany({
      where: { isActive: true, NOT: { id } },
      select: { minSpendAmount: true },
    });
    const thresholds = [
      ...activeTiers.map((tier) => Number(tier.minSpendAmount)),
      ...(isActive ? [minSpendAmount] : []),
    ].sort((a, b) => a - b);
    if (!thresholds.length)
      throw new Error("Phải có ít nhất một hạng membership đang hoạt động.");
    if (new Set(thresholds).size !== thresholds.length)
      throw new Error("Ngưỡng chi tiêu giữa các hạng không được trùng nhau.");
    if (
      data.discountRate !== undefined &&
      (!Number.isFinite(Number(data.discountRate)) ||
        Number(data.discountRate) < 0 ||
        Number(data.discountRate) > 100)
    )
      throw new Error("Tỷ lệ giảm phải từ 0% đến 100%.");
    const membership = await prisma.membership.update({ where: { id }, data });
    await recordAudit({
      actorId: admin.userId,
      action: data.isActive === false ? "DEACTIVATE" : "UPDATE",
      entityType: "MEMBERSHIP",
      entityId: id,
      previousValue: current,
      newValue: membership,
    });
    return NextResponse.json(membership);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật hạng membership.",
      },
      { status: 400 },
    );
  }
}
