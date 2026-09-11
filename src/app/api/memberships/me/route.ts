import { MembershipBenefitType, Prisma } from "@/app/generated/prisma/client";
import { ensureCurrentMembership, getMembershipCycle } from "@/lib/memberships";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const userId = Number(request.headers.get("x-user-id"));
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const membership = await ensureCurrentMembership(userId);
    const cycle = getMembershipCycle();
    const allRanks = await prisma.membership.findMany({ where: { isActive: true }, orderBy: [{ minSpendAmount: "asc" }, { level: "asc" }], select: { id: true, name: true, color: true, minSpendAmount: true } });
    const currentRank = membership.membership
      ? allRanks.find((rank) => rank.id === membership.membership?.id) ?? null
      : null;
    const currentMin = new Prisma.Decimal(currentRank?.minSpendAmount ?? 0);
    const eligibleSpend = new Prisma.Decimal(membership.spending);
    const currentIndex = currentRank
      ? allRanks.findIndex((rank) => rank.id === currentRank.id)
      : -1;
    const nextRank = currentIndex >= 0
      ? allRanks.slice(currentIndex + 1).find((rank) => rank.minSpendAmount.gt(currentMin)) ?? null
      : allRanks[0] ?? null;
    if (nextRank && nextRank.minSpendAmount.lte(currentMin)) {
      console.error("Invalid membership thresholds", { currentRankId: currentRank?.id, nextRankId: nextRank.id });
      return NextResponse.json({ message: "Thông tin hạng thành viên đang được cập nhật." }, { status: 503 });
    }
    const rawRemainingSpend = nextRank
      ? nextRank.minSpendAmount.sub(eligibleSpend)
      : new Prisma.Decimal(0);
    const remainingSpend = rawRemainingSpend.lt(0)
      ? new Prisma.Decimal(0)
      : rawRemainingSpend;
    const progressPercentage = nextRank
      ? Math.max(0, Math.min(100, Number(eligibleSpend.sub(currentMin).div(nextRank.minSpendAmount.sub(currentMin)).mul(100))))
      : 100;
    const benefits = await prisma.membershipBenefit.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] },
          { tiers: { some: { membershipId: membership.membershipId ?? -1 } } },
        ],
      },
      orderBy: [{ priority: "desc" }, { position: "asc" }],
      include: {
        tiers: true,
        redemptions: {
          where: { userId },
          select: { id: true, cycleYear: true, amount: true },
        },
      },
    });
    return NextResponse.json({
      cycle,
      current: {
        ...membership,
        spending: Number(membership.spending),
        membership: membership.membership
          ? {
              ...membership.membership,
              minSpendAmount: Number(membership.membership.minSpendAmount),
              discountRate: Number(membership.membership.discountRate),
            }
          : null,
      },
      currentRank: currentRank
        ? { id: String(currentRank.id), name: currentRank.name, minSpend: Number(currentRank.minSpendAmount), color: currentRank.color, benefits: benefits.map((benefit) => ({ id: benefit.id, name: benefit.name, description: benefit.description, type: benefit.type, icon: benefit.icon })) }
        : null,
      nextRank: nextRank ? { id: String(nextRank.id), name: nextRank.name, minSpend: Number(nextRank.minSpendAmount), color: nextRank.color } : null,
      eligibleSpend: Number(eligibleSpend),
      remainingSpend: Number(remainingSpend),
      progressPercentage,
      periodStart: cycle.start.toISOString(),
      periodEnd: cycle.end.toISOString(),
      calculatedAt: new Date().toISOString(),
      benefits: benefits.map((benefit) => ({
        ...benefit,
        type: benefit.type as MembershipBenefitType,
        redemptions: benefit.redemptions.map((redemption) => ({
          ...redemption,
          amount: Number(redemption.amount),
        })),
      })),
      history: await prisma.membershipHistory.findMany({
        where: { userId },
        orderBy: { cycleYear: "desc" },
        take: 10,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tải membership.",
      },
      { status: 400 },
    );
  }
}
