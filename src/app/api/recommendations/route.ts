import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { withFavoriteMeta } from "@/lib/products/favorites";
import {
  getDedupeBucket,
  getProductRecommendations,
  PRODUCT_VIEW_RETENTION_DAYS,
} from "@/lib/recommendations";
import { generateOpaqueToken } from "@/lib/auth/crypto";

const VISITOR_COOKIE = "qns_visitor_id";
const VISITOR_COOKIE_MAX_AGE = PRODUCT_VIEW_RETENTION_DAYS * 24 * 60 * 60;

function getOrCreateVisitorId(request: NextRequest): {
  id: string;
  isNew: boolean;
} {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{32,64}$/.test(existing)) {
    return { id: existing, isNew: false };
  }
  return { id: generateOpaqueToken(), isNew: true };
}

function setVisitorCookie(response: NextResponse, visitorId: string) {
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
}

function getCustomerId(request: Request): number | undefined {
  if (request.headers.get("x-user-role") !== "CUSTOMER") return undefined;
  const userId = Number(request.headers.get("x-user-id"));
  return Number.isInteger(userId) && userId > 0 ? userId : undefined;
}

export async function GET(request: NextRequest) {
  const visitor = getOrCreateVisitorId(request);
  const responseHeaders = {
    "Cache-Control": "private, no-store, max-age=0",
  };

  try {
    const products = await getProductRecommendations({
      userId: getCustomerId(request),
      visitorId: visitor.id,
    });
    const productIds = products.map((product) => product.id);
    const userId = getCustomerId(request);
    const favoriteIds =
      userId && productIds.length
        ? new Set(
            (
              await prisma.wishlistItem.findMany({
                where: { userId, productId: { in: productIds } },
                select: { productId: true },
              })
            ).map((item) => item.productId),
          )
        : new Set<number>();
    const serialized = products.map((product) =>
      withFavoriteMeta(product, {
        isAdmin: false,
        isFavorited: favoriteIds.has(product.id),
      }),
    );
    const response = NextResponse.json(
      { products: serialized },
      { headers: responseHeaders },
    );
    if (visitor.isNew) setVisitorCookie(response, visitor.id);
    return response;
  } catch (error) {
    console.error("Recommendations failed", error);
    const response = NextResponse.json(
      { products: [] },
      { headers: responseHeaders },
    );
    if (visitor.isNew) setVisitorCookie(response, visitor.id);
    return response;
  }
}

const isUniqueConstraintError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "P2002";

const trackingRate = new Map<string, { windowStartedAt: number; count: number }>();
const TRACKING_RATE_WINDOW_MS = 60_000;
const TRACKING_RATE_LIMIT = 60;

function isTrackingAllowed(identity: string, now: number) {
  const current = trackingRate.get(identity);
  if (!current || now - current.windowStartedAt >= TRACKING_RATE_WINDOW_MS) {
    trackingRate.set(identity, { windowStartedAt: now, count: 1 });
    if (trackingRate.size > 10_000) trackingRate.clear();
    return true;
  }
  if (current.count >= TRACKING_RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

async function mergeAnonymousEvents(
  transaction: Prisma.TransactionClient,
  visitorId: string,
  userId: number,
  cutoff: Date,
) {
  const anonymousEvents = await transaction.productViewEvent.findMany({
    where: { visitorId, userId: null, viewedAt: { gte: cutoff } },
    select: { productId: true, categoryId: true, viewedAt: true },
  });
  if (!anonymousEvents.length) return;

  await transaction.productViewEvent.createMany({
    data: anonymousEvents.map((event) => ({
      visitorId: null,
      userId,
      productId: event.productId,
      categoryId: event.categoryId,
      viewedAt: event.viewedAt,
      dedupeKey: `user:${userId}:${event.productId}:${getDedupeBucket(event.viewedAt)}`,
    })),
    skipDuplicates: true,
  });
  await transaction.productViewEvent.deleteMany({
    where: { visitorId, userId: null, viewedAt: { gte: cutoff } },
  });
}

export async function POST(request: NextRequest) {
  const visitor = getOrCreateVisitorId(request);
  const now = new Date();
  const userId = getCustomerId(request);
  const identity = userId ? `user:${userId}` : `visitor:${visitor.id}`;
  const response = (status = 204) => {
    const result = new NextResponse(null, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
    if (visitor.isNew) setVisitorCookie(result, visitor.id);
    return result;
  };

  if (!isTrackingAllowed(identity, now.getTime())) return response(429);

  const body: unknown = await request.json().catch(() => null);
  const productId =
    typeof body === "object" && body !== null && "productId" in body
      ? Number(body.productId)
      : NaN;
  if (!Number.isInteger(productId) || productId < 1) return response();

  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, status: "PUBLIC" },
      select: { id: true, categoryId: true },
    });
    if (!product) return response();
    // Product.categoryId is the storefront's single canonical category for scoring.

    const cutoff = new Date(
      now.getTime() - PRODUCT_VIEW_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
    );
    await prisma.productViewEvent.deleteMany({ where: { viewedAt: { lt: cutoff } } });
    await prisma.$transaction(async (transaction) => {
      if (userId) {
        await mergeAnonymousEvents(transaction, visitor.id, userId, cutoff);
      }
      try {
        await transaction.productViewEvent.create({
          data: {
            visitorId: userId ? null : visitor.id,
            userId: userId || null,
            productId: product.id,
            categoryId: product.categoryId,
            dedupeKey: `${identity}:${product.id}:${getDedupeBucket(now)}`,
            viewedAt: now,
          },
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
      }
    });
    return response();
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      console.error("Product view tracking failed", error);
    }
    return response();
  }
}
