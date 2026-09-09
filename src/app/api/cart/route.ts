import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const response = (message: string, status = 400) => NextResponse.json({ message }, { status });
const userIdFrom = (request: Request) => Number(request.headers.get("x-user-id"));

const cartItemResponse = (item: {
  id: number; quantity: number; productId: number; variantId: number | null;
  product: { title: string; slug: string | null; imageUrl: string; sellPrice: unknown; quantity: number; status: string; images: { url: string }[]; variants: { id: number; sku: string; color: string | null; size: string | null; sellPrice: unknown; comparePrice: unknown; quantity: number; reservedQuantity: number; images: { url: string }[] }[] };
  variant: { sku: string; color: string | null; size: string | null; sellPrice: unknown; comparePrice: unknown; quantity: number; reservedQuantity: number; images: { url: string }[] } | null;
}) => {
  const variant = item.variant;
  const stock = Math.max(0, Number(variant?.quantity ?? item.product.quantity) - Number(variant?.reservedQuantity ?? 0));
  const price = Number(variant?.sellPrice ?? item.product.sellPrice);
  const comparePrice = Number(variant?.comparePrice || 0);
  return { id: item.id, key: `${item.productId}-${item.variantId ?? "base"}`, productId: item.productId, variantId: item.variantId ?? undefined, slug: item.product.slug, title: item.product.title, imageUrl: variant?.images[0]?.url || item.product.images[0]?.url || item.product.imageUrl, price, comparePrice: comparePrice > price ? comparePrice : null, variantLabel: [variant?.color, variant?.size].filter(Boolean).join(" · "), sku: variant?.sku || null, quantity: item.quantity, stock, status: item.product.status, isEligible: item.product.status === "PUBLIC" && Boolean(variant) && stock > 0 };
};

const include = {
  product: {
    select: {
      title: true, slug: true, imageUrl: true, sellPrice: true, quantity: true, status: true,
      images: { where: { variantId: null }, orderBy: { position: "asc" as const }, take: 1 },
      variants: { select: { id: true, sku: true, color: true, size: true, sellPrice: true, comparePrice: true, quantity: true, reservedQuantity: true, images: { orderBy: { position: "asc" as const }, take: 1 } } },
    },
  },
  variant: { select: { sku: true, color: true, size: true, sellPrice: true, comparePrice: true, quantity: true, reservedQuantity: true, images: { orderBy: { position: "asc" as const }, take: 1 } } },
} as const;

export async function GET(request: Request) {
  const userId = userIdFrom(request);
  if (!Number.isInteger(userId) || userId <= 0) return response("Vui lòng đăng nhập để xem giỏ hàng.", 401);
  const cart = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" }, include: { items: { include } } });
  return NextResponse.json({ items: cart?.items.map(cartItemResponse) || [] });
}

export async function POST(request: Request) {
  const userId = userIdFrom(request);
  if (!Number.isInteger(userId) || userId <= 0) return response("Vui lòng đăng nhập để thêm sản phẩm.", 401);
  try {
    const body = await request.json(); const productId = Number(body.productId); const variantId = body.variantId == null ? null : Number(body.variantId); const quantity = Number(body.quantity ?? 1);
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) return response("Thông tin sản phẩm không hợp lệ.");
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
    if (!product || product.status !== "PUBLIC") return response("Sản phẩm không còn khả dụng.", 404);
    const variant = variantId == null ? null : product.variants.find((item) => item.id === variantId && item.isActive);
    if (variantId != null && !variant) return response("Biến thể sản phẩm không hợp lệ.");
    const stock = Math.max(0, Number(variant?.quantity ?? product.quantity) - Number(variant?.reservedQuantity ?? 0));
    if (stock < quantity) return response("Số lượng sản phẩm không đủ.");
    const cart = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" } }) || await prisma.cart.create({ data: { userId, status: "ACTIVE" } });
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId } });
    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (nextQuantity > stock) return response("Số lượng sản phẩm vượt quá tồn kho.");
    const item = existing ? await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity }, include }) : await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity }, include });
    return NextResponse.json(cartItemResponse(item), { status: 201 });
  } catch (error) { console.error("Add cart item failed", error); return response("Không thể thêm sản phẩm vào giỏ hàng.", 500); }
}
