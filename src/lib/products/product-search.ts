import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { getSearchTokens } from "@/lib/search";

type ProductIdRow = { id: number };

/**
 * PostgreSQL's regular case-insensitive contains query does not ignore
 * Vietnamese diacritics. Use the database unaccent function so all product
 * entry points (admin, order creation and storefront suggestions) agree on
 * what a search term means.
 *
 * Every token must occur in at least one product field, but tokens may occur
 * in different fields. This makes "ao len den" useful even when the words
 * are not adjacent in the stored title.
 */
export async function findProductIdsBySearch(
  value: string | null | undefined,
): Promise<number[] | undefined> {
  const tokens = getSearchTokens(value);
  if (!tokens.length) return [];

  const tokenConditions = tokens.map(
    (token) => Prisma.sql`
      (
        unaccent(lower(p."title")) LIKE '%' || unaccent(lower(${token})) || '%'
        OR unaccent(lower(coalesce(p."slug", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
        OR unaccent(lower(coalesce(p."brand", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
        OR unaccent(lower(coalesce(p."material", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
        OR unaccent(lower(coalesce(p."seoKeywords", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
        OR cast(p."id" as text) LIKE '%' || ${token} || '%'
        OR unaccent(lower(c."name")) LIKE '%' || unaccent(lower(${token})) || '%'
        OR EXISTS (
          SELECT 1
          FROM "product_variant" v
          WHERE v."productId" = p."id"
            AND (
              unaccent(lower(coalesce(v."sku", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
              OR unaccent(lower(coalesce(v."barcode", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
              OR unaccent(lower(coalesce(v."color", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
              OR unaccent(lower(coalesce(v."size", ''))) LIKE '%' || unaccent(lower(${token})) || '%'
            )
        )
      )`,
  );

  try {
    const rows = await prisma.$queryRaw<ProductIdRow[]>(Prisma.sql`
      SELECT p."id" AS id
      FROM "product" p
      INNER JOIN "category" c ON c."id" = p."categoryId"
      WHERE ${Prisma.join(tokenConditions, " AND ")}
      ORDER BY p."createdAt" DESC
    `);
    return rows.map((row) => Number(row.id)).filter(Number.isInteger);
  } catch {
    // Keep the API usable during a rolling deploy where the migration adding
    // unaccent has not run yet. The caller falls back to Prisma's plain search.
    return undefined;
  }
}
