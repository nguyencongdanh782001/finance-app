import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

const getCachedBanners = unstable_cache(
  async () => {
    const now = new Date();
    const activeWindow = {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    };
    return Promise.all([
      prisma.homepageBanner.findFirst({
        where: { placement: "PRODUCT_LISTING", ...activeWindow },
        orderBy: { position: "asc" },
      }),
      prisma.homepageBanner.findFirst({
        where: { placement: "HOME_CATEGORY", ...activeWindow },
        orderBy: { position: "asc" },
      }),
    ]);
  },
  ["public-banners"],
  { revalidate: 300, tags: ["banners"] },
);

export async function GET() {
  const [banner, categoryBanner] = await getCachedBanners();
  return NextResponse.json({ banner, categoryBanner });
}
