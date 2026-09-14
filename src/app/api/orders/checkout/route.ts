/* eslint-disable @typescript-eslint/no-non-null-assertion */
import prisma from "@/lib/db";
import { verifyJwt } from "@/lib/auth/crypto";
import { NextResponse } from "next/server";
import { calculateShippingQuote, validateCoordinates } from "@/lib/geoapify";

const fail = (message: string, status = 400) => NextResponse.json({ message }, { status });

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!Number.isInteger(userId) || userId < 1 || request.headers.get("x-user-role") !== "CUSTOMER") return fail("Vui lòng đăng nhập để đặt hàng.", 401);
  const body = await request.json().catch(() => ({}));
  const token = String(body.intent || "");
  const payload = await verifyJwt(token).catch(() => null);
  if (!payload || !["BUY_NOW", "CART"].includes(payload.intentType || "") || payload.sub !== String(userId)) return fail("Phiên thanh toán đã hết hạn.", 401);
  const receiverName = String(body.receiverName || "").trim();
  const receiverPhone = String(body.receiverPhone || "").trim();
  const receiverAddress = String(body.receiverAddress || "").trim();
  const destinationLatitude = Number(body.destinationLatitude);
  const destinationLongitude = Number(body.destinationLongitude);
  const paymentMethod = body.paymentMethod === "MOMO" ? "MOMO" : "COD";
  if (!receiverName || !receiverPhone || !receiverAddress) return fail("Vui lòng nhập đủ thông tin nhận hàng.");
  if (!validateCoordinates(destinationLatitude, destinationLongitude)) return fail("Vui lòng chọn địa chỉ giao hàng từ danh sách gợi ý.", 422);

  try {
    const quote = await calculateShippingQuote(destinationLatitude, destinationLongitude);
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { idempotencyKey: token }, select: { id: true, orderNumber: true } });
      if (existing) return existing;
      if (payload.intentType === "CART") {
        const cart = await tx.cart.findFirst({ where: { userId, status: "ACTIVE" }, select: { id: true } });
        const cartItems = cart ? await tx.cartItem.findMany({ where: { cartId: cart.id, id: { in: payload.cartItemIds || [] } }, include: { product: true, variant: true } }) : [];
        if (cartItems.length !== (payload.cartItemIds || []).length || cartItems.some((item) => !item.variant || !item.variant.isActive || item.product.status !== "PUBLIC")) throw new Error("Sản phẩm trong giỏ hàng không còn khả dụng.");
        const lines = [] as Array<{ item: (typeof cartItems)[number]; price: number; cost: number; total: number }>;
        for (const item of cartItems) {
          const variant = item.variant!;
          const update = await tx.productVariant.updateMany({ where: { id: variant.id, isActive: true, quantity: { gte: item.quantity + variant.reservedQuantity } }, data: { quantity: { decrement: item.quantity } } });
          if (!update.count) throw new Error("Số lượng sản phẩm không còn đủ.");
          const price = Number(variant.sellPrice); const cost = Number(variant.importPrice); lines.push({ item, price, cost, total: price * item.quantity });
        }
        const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
        const orderNumber = `QN-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
        const created = await tx.order.create({ data: { orderNumber, idempotencyKey: token, userId, source: "ONLINE", status: "PENDING", subtotal, shippingFee: quote.shippingFee, totalAmount: subtotal + quote.shippingFee, remainingAmount: subtotal + quote.shippingFee, receiverName, receiverPhone, receiverAddress, latitude: destinationLatitude, longitude: destinationLongitude, shippingDistanceMeters: quote.distanceMeters, shippingDistanceKm: quote.distanceKm, shippingEstimatedMinutes: quote.estimatedDurationMinutes, paymentMethod, items: { create: lines.map(({ item, price, cost, total }) => ({ productId: item.productId, variantId: item.variantId!, productTitle: item.product.title, productImageUrl: item.product.imageUrl, sku: item.variant!.sku, size: item.variant!.size, color: item.variant!.color, quantity: item.quantity, originalUnitPrice: price, unitPrice: price, unitCost: cost, totalPrice: total, lineSubtotal: total, lineCost: cost * item.quantity, lineProfit: (price - cost) * item.quantity })) } }, select: { id: true, orderNumber: true } });
        for (const { item, price, cost } of lines) await tx.inventoryTransaction.create({ data: { productId: item.productId, variantId: item.variantId, type: "SALE", quantity: -item.quantity, balanceAfter: Math.max(0, item.variant!.quantity - item.quantity), referenceType: "ORDER", referenceId: created.id, note: `Đặt hàng ${created.orderNumber}`, unitImportPrice: cost, unitSellPrice: price } });
        await tx.cartItem.deleteMany({ where: { cartId: cart!.id, id: { in: payload.cartItemIds || [] } } });
        return created;
      }
      if (!payload.variantId || !payload.quantity) throw new Error("Phiên mua ngay đã hết hạn.");
      const variantId = payload.variantId;
      const quantity = payload.quantity;
      const variant = await tx.productVariant.findUnique({ where: { id: variantId }, include: { product: true } });
      if (!variant || !variant.isActive || variant.product.status !== "PUBLIC") throw new Error("Sản phẩm không còn khả dụng.");
      const stockUpdate = await tx.productVariant.updateMany({ where: { id: variant.id, isActive: true, quantity: { gte: quantity + variant.reservedQuantity } }, data: { quantity: { decrement: quantity } } });
      if (!stockUpdate.count) throw new Error("Số lượng sản phẩm không còn đủ.");
      const price = Number(variant.sellPrice);
      const cost = Number(variant.importPrice);
      const total = price * quantity;
      const orderNumber = `QN-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      const created = await tx.order.create({ data: { orderNumber, idempotencyKey: token, userId, source: "ONLINE", status: "PENDING", subtotal: total, shippingFee: quote.shippingFee, totalAmount: total + quote.shippingFee, remainingAmount: total + quote.shippingFee, receiverName, receiverPhone, receiverAddress, latitude: destinationLatitude, longitude: destinationLongitude, shippingDistanceMeters: quote.distanceMeters, shippingDistanceKm: quote.distanceKm, shippingEstimatedMinutes: quote.estimatedDurationMinutes, paymentMethod, items: { create: { productId: variant.productId, variantId: variant.id, productTitle: variant.product.title, productImageUrl: variant.product.imageUrl, sku: variant.sku, size: variant.size, color: variant.color, quantity, originalUnitPrice: price, unitPrice: price, unitCost: cost, totalPrice: total, lineSubtotal: total, lineCost: cost * quantity, lineProfit: (price - cost) * quantity } } }, select: { id: true, orderNumber: true } });
      await tx.inventoryTransaction.create({ data: { productId: variant.productId, variantId: variant.id, type: "SALE", quantity: -quantity, balanceAfter: Math.max(0, variant.quantity - quantity), referenceType: "ORDER", referenceId: created.id, note: `Đặt hàng ${created.orderNumber}`, unitImportPrice: cost, unitSellPrice: price } });
      return created;
    });
    return NextResponse.json(order, { status: 201 });
  } catch (cause) {
    return fail(cause instanceof Error ? cause.message : "Không thể tạo đơn hàng.", 409);
  }
}
