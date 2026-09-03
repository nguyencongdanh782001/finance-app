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

const validateTiers = async (candidate: {
  id?: number;
  minSpendAmount: number;
  isActive: boolean;
}) => {
  const tiers = await prisma.membership.findMany({
    where: {
      isActive: true,
      ...(candidate.id ? { NOT: { id: candidate.id } } : {}),
    },
    select: { minSpendAmount: true },
    orderBy: { minSpendAmount: "asc" },
  });
  const thresholds = [
    ...tiers.map((tier) => Number(tier.minSpendAmount)),
    ...(candidate.isActive ? [candidate.minSpendAmount] : []),
  ].sort((a, b) => a - b);
  if (!thresholds.length)
    throw new Error("Phải có ít nhất một hạng membership đang hoạt động.");
  if (new Set(thresholds).size !== thresholds.length)
    throw new Error("Ngưỡng chi tiêu giữa các hạng không được trùng nhau.");
};

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const memberships = await prisma.membership.findMany({
      orderBy: [{ priority: "desc" }, { level: "asc" }, { name: "asc" }],
      include: { _count: { select: { users: true } } },
    });
    return NextResponse.json(
      memberships.map((membership) => ({
        ...membership,
        memberCount: membership._count.users,
      })),
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải hạng thành viên.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name || "").trim();
    const code = toCode(String(body.code || name));
    const level = Math.round(Number(body.level));
    const rawMinSpendAmount = Number(body.minSpendAmount);
    const rawDiscountRate = Number(body.discountRate);
    if (!Number.isFinite(rawMinSpendAmount) || rawMinSpendAmount < 0)
      throw new Error("Ngưỡng chi tiêu phải là số không âm.");
    if (
      !Number.isFinite(rawDiscountRate) ||
      rawDiscountRate < 0 ||
      rawDiscountRate > 100
    )
      throw new Error("Tỷ lệ giảm phải từ 0% đến 100%.");
    const minSpendAmount = Math.round(rawMinSpendAmount);
    const discountRate = Math.round(rawDiscountRate);
    const birthdayMaxDiscountAmount = body.birthdayMaxDiscountAmount
      ? Math.max(0, Math.round(Number(body.birthdayMaxDiscountAmount)))
      : null;
    if (!name) throw new Error("Vui lòng nhập tên hạng membership.");
    if (!code) throw new Error("Vui lòng nhập mã hạng membership.");
    if (!Number.isFinite(level) || level < 0)
      throw new Error("Cấp độ membership không hợp lệ.");
    const isActive = body.isActive !== false;
    await validateTiers({ minSpendAmount, isActive });
    const membership = await prisma.membership.create({
      data: {
        name,
        code,
        description: body.description ? String(body.description) : null,
        terms: body.terms ? String(body.terms) : null,
        color: body.color ? String(body.color) : null,
        icon: body.icon ? String(body.icon) : null,
        level,
        minSpendAmount,
        discountRate,
        birthdayMaxDiscountAmount,
        priority: level,
        isActive,
      },
    });
    await recordAudit({
      actorId: admin.userId,
      action: "CREATE",
      entityType: "MEMBERSHIP",
      entityId: membership.id,
      newValue: membership,
    });
    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo hạng membership.",
      },
      { status: 400 },
    );
  }
}
