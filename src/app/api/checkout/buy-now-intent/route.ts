import prisma from "@/lib/db";
import { signJwt, verifyJwt } from "@/lib/auth/crypto";
import { NextResponse } from "next/server";

const error = (message: string, status = 400) => NextResponse.json({ message }, { status });
const userId = (request: Request) => Number(request.headers.get("x-user-id"));

const getVariant = async (variantId: number, quantity: number) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { id: true, title: true, status: true, imageUrl: true } } },
  });
  if (!variant || !variant.isActive || variant.product.status !== "PUBLIC") return null;
  const available = Math.max(0, variant.quantity - variant.reservedQuantity);
  if (available < quantity) return null;
  return { variant, available };
};

export async function POST(request: Request) {
  const id = userId(request);
  if (!Number.isInteger(id) || id < 1 || request.headers.get("x-user-role") !== "CUSTOMER") return error("Vui lòng đăng nhập để mua hàng.", 401);
  const body = await request.json().catch(() => ({}));
  const variantId = Number(body.variantId);
  const quantity = Number(body.quantity);
  if (!Number.isInteger(variantId) || !Number.isInteger(quantity) || quantity < 1) return error("Thông tin mua ngay không hợp lệ.");
  if (!await getVariant(variantId, quantity)) return error("Số lượng sản phẩm không còn đủ.", 409);
  const token = await signJwt({ sub: String(id), role: "CUSTOMER", intentType: "BUY_NOW", variantId, quantity }, 300);
  return NextResponse.json({ token, expiresIn: 300 });
}

export async function GET(request: Request) {
  const id = userId(request);
  if (!Number.isInteger(id) || id < 1 || request.headers.get("x-user-role") !== "CUSTOMER") return error("Vui lòng đăng nhập để mua hàng.", 401);
  const token = new URL(request.url).searchParams.get("token") || "";
  const payload = await verifyJwt(token).catch(() => null);
  if (!payload || payload.intentType !== "BUY_NOW" || payload.sub !== String(id) || !payload.variantId || !payload.quantity) return error("Phiên mua ngay đã hết hạn.", 401);
  const result = await getVariant(payload.variantId, payload.quantity);
  if (!result) return error("Sản phẩm vừa hết hàng hoặc đã thay đổi.", 409);
  return NextResponse.json({ variantId: result.variant.id, quantity: payload.quantity, title: result.variant.product.title, price: Number(result.variant.sellPrice), imageUrl: result.variant.product.imageUrl, variantLabel: [result.variant.color, result.variant.size].filter(Boolean).join(" · "), available: result.available });
}
