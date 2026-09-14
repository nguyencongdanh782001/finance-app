import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const activeWindow = {
    isActive: true,
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
  };
  const [banner, categoryBanner] = await Promise.all([
    prisma.homepageBanner.findFirst({
      where: { placement: "PRODUCT_LISTING", ...activeWindow },
      orderBy: { position: "asc" },
    }),
    prisma.homepageBanner.findFirst({
      where: { placement: "HOME_CATEGORY", ...activeWindow },
      orderBy: { position: "asc" },
    }),
  ]);
  return NextResponse.json({ banner, categoryBanner });
}
