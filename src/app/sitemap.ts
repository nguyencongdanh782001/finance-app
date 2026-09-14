import prisma from "@/lib/db";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const baseUrl = siteUrl.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/policies`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [products, policies] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLIC", slug: { not: null } },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.storePolicy.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return [
      ...staticRoutes,
      ...products.flatMap((product) =>
        product.slug
          ? [
              {
                url: `${baseUrl}/products/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: "weekly" as const,
                priority: 0.8,
              },
            ]
          : [],
      ),
      ...policies.map((policy) => ({
        url: `${baseUrl}/policies?policy=${encodeURIComponent(policy.slug)}`,
        lastModified: policy.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    console.error("Sitemap generation failed", error);
    return staticRoutes;
  }
}
