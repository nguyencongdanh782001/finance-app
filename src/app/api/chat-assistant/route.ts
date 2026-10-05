import { NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { answerChatAssistantWithAI } from "@/lib/chat-assistant/gemini";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  InMemoryRateLimiter,
  parseChatRequest,
} from "@/lib/chat-assistant/request";
import type { ChatAssistantData } from "@/lib/chat-assistant/types";

const limiter = new InMemoryRateLimiter(24, 60_000);
const MAX_BODY_BYTES = 4_096;
const MAX_PRODUCTS = 80;
const MAX_POLICIES = 12;

const assistantProductSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  descriptionHtml: true,
  imageUrl: true,
  sellPrice: true,
  quantity: true,
  status: true,
  images: {
    where: { variantId: null },
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    take: 1,
    select: { url: true },
  },
  variants: {
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      color: true,
      size: true,
      sellPrice: true,
      quantity: true,
      reservedQuantity: true,
      isActive: true,
    },
  },
} satisfies Prisma.ProductSelect;

const plainText = (value: string | null | undefined) =>
  sanitizeHtml(value || "", { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clientKey = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { message: `Tin nhắn tối đa ${CHAT_MESSAGE_MAX_LENGTH} ký tự.` },
      { status: 413 },
    );
  }

  const rate = limiter.consume(clientKey(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Bạn đang gửi quá nhanh. Vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { message: `Tin nhắn tối đa ${CHAT_MESSAGE_MAX_LENGTH} ký tự.` },
        { status: 413 },
      );
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }
  const payload = parseChatRequest(body);
  if (!payload) {
    return NextResponse.json(
      {
        message: `Vui lòng nhập câu hỏi từ 1 đến ${CHAT_MESSAGE_MAX_LENGTH} ký tự.`,
      },
      { status: 400 },
    );
  }

  try {
    const [recentProducts, policies, settings, contextualProduct] =
      await Promise.all([
        prisma.product.findMany({
          where: { status: "PUBLIC" },
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: MAX_PRODUCTS,
          select: assistantProductSelect,
        }),
        prisma.storePolicy.findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ footerOrder: "asc" }, { title: "asc" }],
          take: MAX_POLICIES,
          select: {
            type: true,
            title: true,
            slug: true,
            summary: true,
            summaryText: true,
            summaryHtml: true,
            contentHtml: true,
            content: true,
          },
        }),
        prisma.storeSetting.findFirst({
          orderBy: { id: "asc" },
          select: { storeName: true, phone: true, email: true, address: true },
        }),
        payload.context
          ? prisma.product.findFirst({
              where: {
                status: "PUBLIC",
                OR: [
                  ...(payload.context.id ? [{ id: payload.context.id }] : []),
                  ...(payload.context.slug
                    ? [{ slug: payload.context.slug }]
                    : []),
                ],
              },
              select: assistantProductSelect,
            })
          : Promise.resolve(null),
      ]);

    const products =
      contextualProduct &&
      !recentProducts.some((product) => product.id === contextualProduct.id)
        ? [contextualProduct, ...recentProducts]
        : recentProducts;

    const data: ChatAssistantData = {
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: plainText(product.descriptionHtml || product.description),
        imageUrl: product.images[0]?.url || product.imageUrl,
        basePrice: Number(product.sellPrice),
        baseQuantity: product.quantity,
        status: product.status,
        variants: product.variants.map((variant) => ({
          color: variant.color,
          size: variant.size,
          price: Number(variant.sellPrice),
          quantity: variant.quantity,
          reservedQuantity: variant.reservedQuantity,
          isActive: variant.isActive,
        })),
      })),
      policies: policies.map((policy) => {
        const contentFromJson =
          typeof policy.content === "object" &&
          policy.content &&
          "html" in policy.content
            ? String((policy.content as { html?: unknown }).html || "")
            : "";
        return {
          type: policy.type,
          title: policy.title,
          slug: policy.slug,
          summary: plainText(
            policy.summaryText || policy.summaryHtml || policy.summary,
          ),
          content: plainText(policy.contentHtml || contentFromJson),
        };
      }),
      contact: {
        storeName: settings?.storeName?.trim() || "Quỳnh Nhi Store",
        phone: settings?.phone?.trim() || null,
        email: settings?.email?.trim() || null,
        address: settings?.address?.trim() || null,
      },
    };

    return NextResponse.json(
      await answerChatAssistantWithAI(payload.message, data, payload.context),
    );
  } catch (error) {
    console.error("Customer chat assistant failed", error);
    return NextResponse.json(
      { message: "Trợ lý đang tạm gián đoạn. Bạn vui lòng thử lại sau." },
      { status: 503 },
    );
  }
}
