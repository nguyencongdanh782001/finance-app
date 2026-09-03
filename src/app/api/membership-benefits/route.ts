import { MembershipBenefitType, Prisma } from "@/app/generated/prisma/client";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";

const errorResponse = (error: unknown) =>
  NextResponse.json(
    {
      message:
        error instanceof Error ? error.message : "Không thể xử lý quyền lợi.",
    },
    { status: 400 },
  );
const parseDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime()))
    throw new Error("Ngày hiệu lực không hợp lệ.");
  return date;
};

const parsePayload = (body: Record<string, unknown>) => {
  const name = String(body.name || "").trim();
  const code = String(body.code || name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const type = String(body.type || "CUSTOM_TEXT") as MembershipBenefitType;
  if (!name || !code) throw new Error("Tên và mã quyền lợi là bắt buộc.");
  if (!Object.values(MembershipBenefitType).includes(type))
    throw new Error("Loại quyền lợi không hợp lệ.");
  const startsAt = parseDate(body.startsAt);
  const endsAt = parseDate(body.endsAt);
  if (startsAt && endsAt && startsAt > endsAt)
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
  const usageLimit =
    body.usageLimit === "" || body.usageLimit == null
      ? null
      : Math.round(Number(body.usageLimit));
  const usageLimitPerUser =
    body.usageLimitPerUser === "" || body.usageLimitPerUser == null
      ? null
      : Math.round(Number(body.usageLimitPerUser));
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1))
    throw new Error("Giới hạn lượt dùng không hợp lệ.");
  if (
    usageLimitPerUser !== null &&
    (!Number.isInteger(usageLimitPerUser) || usageLimitPerUser < 1)
  )
    throw new Error("Giới hạn mỗi khách hàng không hợp lệ.");
  const tierIds = Array.isArray(body.membershipIds)
    ? body.membershipIds.map(Number).filter(Number.isInteger)
    : [];
  if (!tierIds.length)
    throw new Error("Quyền lợi phải được gán cho ít nhất một hạng membership.");
  return {
    name,
    code,
    description: body.description ? String(body.description) : null,
    type,
    icon: body.icon ? String(body.icon) : null,
    isActive: body.isActive !== false,
    position: Math.max(0, Math.round(Number(body.position || 0))),
    startsAt,
    endsAt,
    usageLimit,
    usageLimitPerUser,
    automatic: body.automatic !== false,
    requiresRedemption: body.requiresRedemption === true,
    minOrderValue: body.minOrderValue
      ? Math.max(0, Math.round(Number(body.minOrderValue)))
      : null,
    maxDiscountAmount: body.maxDiscountAmount
      ? Math.max(0, Math.round(Number(body.maxDiscountAmount)))
      : null,
    salesChannels:
      body.salesChannels == null ? Prisma.JsonNull : body.salesChannels,
    canCombineWithCoupons: body.canCombineWithCoupons === true,
    canCombineWithBenefits: body.canCombineWithBenefits === true,
    priority: Math.round(Number(body.priority || 0)),
    internalNotes: body.internalNotes ? String(body.internalNotes) : null,
    tierIds,
  };
};

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const benefits = await prisma.membershipBenefit.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: {
        tiers: {
          include: {
            membership: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });
    return NextResponse.json(
      benefits.map((benefit) => ({
        ...benefit,
        tiers: benefit.tiers.map((tier) => ({
          ...tier,
          value: tier.value === null ? null : Number(tier.value),
        })),
      })),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const data = parsePayload(
      (await request.json()) as Record<string, unknown>,
    );
    const { tierIds, ...benefitData } = data;
    const benefit = await prisma.membershipBenefit.create({
      data: {
        ...benefitData,
        tiers: tierIds.length
          ? { create: tierIds.map((membershipId) => ({ membershipId })) }
          : undefined,
      },
      include: { tiers: true },
    });
    await recordAudit({
      actorId: admin.userId,
      action: "CREATE",
      entityType: "MEMBERSHIP_BENEFIT",
      entityId: benefit.id,
      newValue: benefit,
    });
    return NextResponse.json(benefit, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
