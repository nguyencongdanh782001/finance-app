import {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "@/app/generated/prisma/client";
import prisma from "@/lib/db";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

const getYear = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === "year")?.value);
};

const getCycleRange = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1, 0, 0, 0) - 7 * 60 * 60 * 1000),
  end: new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0) - 7 * 60 * 60 * 1000),
});

const tierOrder = [
  { minSpendAmount: "asc" as const },
  { level: "asc" as const },
  { priority: "asc" as const },
];

type DbClient = typeof prisma | Prisma.TransactionClient;

export const getMembershipCycle = (date = new Date()) => {
  const year = getYear(date);
  const range = getCycleRange(year);

  return { year, ...range };
};

const getEligibleSpending = async (
  client: DbClient,
  userId: number,
  start: Date,
  end: Date,
) => {
  const result = await client.order.aggregate({
    where: {
      userId,
      status: OrderStatus.COMPLETED,
      paymentStatus: {
        in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED],
      },
      paidAmount: { gt: 0 },
      placedAt: { gte: start, lt: end },
    },
    _sum: { paidAmount: true },
  });

  return result._sum.paidAmount ?? new Prisma.Decimal(0);
};

const tierSnapshot = (tier: {
  id: number;
  name: string;
  minSpendAmount: Prisma.Decimal;
  discountRate: Prisma.Decimal;
}) => ({
  membershipId: tier.id,
  membershipNameSnapshot: tier.name,
  minSpendAmountSnapshot: tier.minSpendAmount,
  discountRateSnapshot: tier.discountRate,
});

export const ensureCurrentMembership = async (
  userId: number,
  date = new Date(),
  client: DbClient = prisma,
) => {
  const cycle = getMembershipCycle(date);
  const tiers = await client.membership.findMany({
    where: { isActive: true },
    orderBy: tierOrder,
    select: {
      id: true,
      name: true,
      level: true,
      priority: true,
      minSpendAmount: true,
      discountRate: true,
      birthdayMaxDiscountAmount: true,
    },
  });

  if (!tiers.length) {
    throw new Error("Chưa có hạng membership đang hoạt động.");
  }

  const lowestTier = tiers[0];
  const history = await client.membershipHistory.findUnique({
    where: { userId_cycleYear: { userId, cycleYear: cycle.year } },
  });
  const spending = await getEligibleSpending(
    client,
    userId,
    cycle.start,
    cycle.end,
  );
  const calculatedTier =
    [...tiers].reverse().find((tier) => spending.gte(tier.minSpendAmount)) ??
    lowestTier;

  if (!history) {
    const created = await client.membershipHistory.create({
      data: {
        userId,
        cycleYear: cycle.year,
        ...tierSnapshot(lowestTier),
        spending,
        rankStartDate: cycle.start,
        rankEndDate: cycle.end,
        reason: "ANNUAL_RESET",
      },
    });
    await client.user.update({
      where: { id: userId },
      data: { membershipId: lowestTier.id },
    });
    return { ...created, membership: lowestTier, spending };
  }

  const currentTier = tiers.find((tier) => tier.id === history.membershipId);
  const tier =
    currentTier && calculatedTier.level < currentTier.level
      ? currentTier
      : calculatedTier;
  const shouldUpgrade = tier.id !== history.membershipId;
  const updated = await client.membershipHistory.update({
    where: { id: history.id },
    data: {
      ...tierSnapshot(tier),
      spending,
      reason: shouldUpgrade ? "SPENDING_UPGRADE" : history.reason,
    },
  });

  if (shouldUpgrade) {
    await client.user.update({
      where: { id: userId },
      data: { membershipId: tier.id },
    });
  }

  return { ...updated, membership: tier, spending };
};

export const runAnnualMembershipReset = async (
  year = getMembershipCycle().year,
) => {
  const existingRun = await prisma.membershipResetRun.findUnique({
    where: { cycleYear: year },
  });
  if (existingRun?.status === "COMPLETED") return existingRun;

  const run = existingRun
    ? await prisma.membershipResetRun.update({
        where: { id: existingRun.id },
        data: { status: "RUNNING", errorMessage: null, startedAt: new Date() },
      })
    : await prisma.membershipResetRun.create({
        data: {
          cycleYear: year,
          status: "RUNNING",
          reason: "MANUAL_OR_LAZY_RESET",
        },
      });

  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER", status: "ACTIVE" },
      select: { id: true },
    });
    for (const user of users) {
      await prisma.$transaction((tx) =>
        ensureCurrentMembership(user.id, new Date(year, 0, 2), tx),
      );
    }
    return await prisma.membershipResetRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        processedCount: users.length,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.membershipResetRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorMessage:
          error instanceof Error ? error.message : "Unknown reset error",
      },
    });
    throw error;
  }
};
