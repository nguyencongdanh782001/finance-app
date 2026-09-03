import { MembershipBenefitType } from "@/app/generated/prisma/client";
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
        membership: {
          ...membership.membership,
          minSpendAmount: Number(membership.membership.minSpendAmount),
          discountRate: Number(membership.membership.discountRate),
        },
      },
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
