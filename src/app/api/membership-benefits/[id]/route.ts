import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = getAdminFromRequest(request);
    const id = Number((await context.params).id);
    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    for (const key of ["name", "description", "icon", "internalNotes"] as const)
      if (body[key] !== undefined)
        data[key] = body[key] ? String(body[key]) : null;
    for (const key of [
      "isActive",
      "automatic",
      "requiresRedemption",
      "canCombineWithCoupons",
      "canCombineWithBenefits",
    ] as const)
      if (body[key] !== undefined) data[key] = body[key] === true;
    for (const key of [
      "position",
      "priority",
      "usageLimit",
      "usageLimitPerUser",
      "minOrderValue",
      "maxDiscountAmount",
    ] as const)
      if (body[key] !== undefined)
        data[key] =
          body[key] === null || body[key] === ""
            ? null
            : Math.max(0, Math.round(Number(body[key])));
    if (body.startsAt !== undefined)
      data.startsAt = body.startsAt ? new Date(String(body.startsAt)) : null;
    if (body.endsAt !== undefined)
      data.endsAt = body.endsAt ? new Date(String(body.endsAt)) : null;
    if (body.tierIds !== undefined) {
      const tierIds = Array.isArray(body.tierIds)
        ? body.tierIds.map(Number).filter(Number.isInteger)
        : [];
      data.tiers = {
        deleteMany: {},
        create: tierIds.map((membershipId) => ({ membershipId })),
      };
    }
    const previous = await prisma.membershipBenefit.findUniqueOrThrow({
      where: { id },
      include: { tiers: true },
    });
    const benefit = await prisma.membershipBenefit.update({
      where: { id },
      data: data as never,
      include: { tiers: true },
    });
    await recordAudit({
      actorId: admin.userId,
      action: data.isActive === false ? "DEACTIVATE" : "UPDATE",
      entityType: "MEMBERSHIP_BENEFIT",
      entityId: id,
      previousValue: previous,
      newValue: benefit,
    });
    return NextResponse.json(benefit);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật quyền lợi.",
      },
      { status: 400 },
    );
  }
}
