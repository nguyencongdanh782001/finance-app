import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";

const response = (body: unknown, status = 200) => NextResponse.json(body, { status });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    getAdminFromRequest(request);
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id: Number(id) }, select: { id: true, title: true, organicFavoriteCount: true, favoriteCountAdjustment: true } });
    if (!product) return response({ message: "Product not found" }, 404);
    return response({ ...product, displayFavoriteCount: Math.max(0, product.organicFavoriteCount + product.favoriteCountAdjustment) });
  } catch (error) {
    return response({ message: error instanceof Error ? error.message : "Unauthorized" }, 401);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(request);
    const { id } = await params;
    const productId = Number(id);
    const body = await request.json() as { desiredDisplayCount?: number; reason?: string };
    const desired = Number(body.desiredDisplayCount);
    if (!Number.isInteger(productId) || !Number.isInteger(desired) || desired < 0 || desired > 100_000_000) return response({ message: "Số lượt yêu thích không hợp lệ" }, 400);
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true, title: true, organicFavoriteCount: true, favoriteCountAdjustment: true } });
      if (!product) throw new Error("Product not found");
      const displayBefore = Math.max(0, product.organicFavoriteCount + product.favoriteCountAdjustment);
      const adjustment = desired - product.organicFavoriteCount;
      const updated = await tx.product.update({ where: { id: productId }, data: { favoriteCountAdjustment: adjustment }, select: { id: true, title: true, organicFavoriteCount: true, favoriteCountAdjustment: true } });
      await tx.productFavoriteAdjustmentLog.create({ data: { productId, adminId: admin.userId, previousAdjustment: product.favoriteCountAdjustment, newAdjustment: adjustment, organicCount: product.organicFavoriteCount, previousDisplayCount: displayBefore, newDisplayCount: Math.max(0, product.organicFavoriteCount + adjustment), reason: typeof body.reason === "string" && body.reason.trim() ? body.reason.trim().slice(0, 500) : null } });
      return updated;
    });
    return response({ ...result, displayFavoriteCount: Math.max(0, result.organicFavoriteCount + result.favoriteCountAdjustment) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật";
    return response({ message }, message === "Product not found" ? 404 : 400);
  }
}
