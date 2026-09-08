import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const banner = await prisma.homepageBanner.findFirst({
    where: { placement: "PRODUCT_LISTING", isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ banner });
}
