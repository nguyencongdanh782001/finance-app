import prisma from "@/lib/db";
import { withFavoriteMeta } from "@/lib/products/favorites";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

const productInclude = {
  category: true,
  images: { where: { variantId: null }, orderBy: { position: "asc" as const } },
  variants: {
    where: { isActive: true },
    orderBy: { createdAt: "asc" as const },
    include: { images: { orderBy: { position: "asc" as const } } },
  },
};

const getCachedHomepageData = unstable_cache(
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
      prisma.homepageBanner.findMany({
        where: {
          placement: { in: ["HERO", "HOME_HERO"] },
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { position: "asc" },
      }),
      prisma.homepageBanner.findMany({
        where: {
          placement: "HOME_CAMPAIGN",
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { position: "asc" },
      }),
      prisma.homepageBanner.findMany({
        where: {
          placement: "HOME_CATEGORY",
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { position: "asc" },
      }),
      prisma.homepageBanner.findFirst({
        where: {
          placement: "ANNOUNCEMENT_BAR",
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { position: "asc" },
      }),
      prisma.homepageFeaturedProduct.findMany({
        where: activeWindow,
        orderBy: { position: "asc" },
        take: 8,
        include: { product: { include: productInclude } },
      }),
      prisma.homepageSection.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
        take: 12,
        include: {
          products: {
            orderBy: { position: "asc" },
            take: 8,
            include: { product: { include: productInclude } },
          },
        },
      }),
      prisma.product.findMany({
        where: { status: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: productInclude,
      }),
      prisma.category.findMany({
        where: { isActive: true, products: { some: { status: "PUBLIC" } } },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        take: 8,
        include: {
          _count: { select: { products: { where: { status: "PUBLIC" } } } },
          products: {
            where: { status: "PUBLIC" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { imageUrl: true },
          },
        },
      }),
    ]);
  },
  ["homepage-public-v1"],
  { revalidate: 300, tags: ["homepage", "products", "categories", "banners"] },
);

export async function GET(request: Request) {
  try {
    const [
      banners,
      campaignBanners,
      categoryBanners,
      announcement,
      featured,
      sections,
      products,
      categories,
    ] = await getCachedHomepageData();
    const requesterRole = request.headers.get("x-user-role");
    const requesterId =
      requesterRole === "CUSTOMER"
        ? Number(request.headers.get("x-user-id"))
        : 0;
    const publicFeatured = featured.filter(
      (item) => item.product.status === "PUBLIC",
    );
    const publicSections = sections
      .map((section) => ({
        ...section,
        products: section.products.filter(
          (item) => item.product.status === "PUBLIC",
        ),
      }))
      .filter((section) => section.products.length);
    const allProducts = [
      ...products,
      ...publicFeatured.map((item) => item.product),
      ...publicSections.flatMap((section) =>
        section.products.map((item) => item.product),
      ),
    ];
    const ids = [...new Set(allProducts.map((product) => product.id))];
    const favoriteIds =
      requesterId && ids.length
        ? new Set(
            (
              await prisma.wishlistItem.findMany({
                where: { userId: requesterId, productId: { in: ids } },
                select: { productId: true },
              })
            ).map((item) => item.productId),
          )
        : new Set<number>();
    const serialize = (product: (typeof products)[number]) =>
      withFavoriteMeta(product, {
        isAdmin: false,
        isFavorited: favoriteIds.has(product.id),
      });
    return NextResponse.json({
      banners,
      campaignBanners,
      categoryBanners,
      announcement,
      newArrivals: products.slice(0, 8).map(serialize),
      featuredProducts: publicFeatured.map((item) => ({
        ...item,
        product: serialize(item.product),
      })),
      sections: publicSections.map((section) => ({
        ...section,
        products: section.products.map((item) => ({
          ...item,
          product: serialize(item.product),
        })),
      })),
      categories,
    });
  } catch (error) {
    console.error("Homepage content failed", error);
    return NextResponse.json(
      { message: "Không thể tải nội dung trang chủ." },
      { status: 500 },
    );
  }
}
