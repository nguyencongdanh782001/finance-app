import crypto from "node:crypto";
import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

const invoiceInclude = {
  order: {
    include: {
      items: { orderBy: { id: "asc" as const } },
      user: { select: { displayName: true, email: true, phone: true } },
    },
  },
  items: { orderBy: { id: "asc" as const } },
  issuedBy: { select: { displayName: true, email: true } },
  voidedBy: { select: { displayName: true, email: true } },
} as const;

type InvoiceWithRelations = Prisma.OrderInvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;

const vietnamDateParts = (date: Date) => {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return {
    year: Number(values.find((item) => item.type === "year")?.value),
    month: Number(values.find((item) => item.type === "month")?.value),
    day: Number(values.find((item) => item.type === "day")?.value),
  };
};

const decimal = (value: Prisma.Decimal | number | string | null | undefined) =>
  new Prisma.Decimal(value ?? 0);

const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
  decimal(value).toNumber();

const makePublicToken = () => crypto.randomBytes(32).toString("base64url");

const publicUrl = (token: string) =>
  `${process.env.NEXT_PUBLIC_SITE_URL || ""}/invoice/${token}`;

async function getSellerSnapshot(tx: Prisma.TransactionClient | typeof prisma) {
  const settings = await tx.storeSetting.findFirst({ orderBy: { id: "asc" } });
  return {
    sellerName: settings?.storeName || null,
    sellerPhone: settings?.phone || null,
    sellerEmail: settings?.email || null,
    sellerAddress: settings?.address || null,
    sellerLogoUrl: settings?.logoUrl || null,
    sellerTaxCode: settings?.taxCode || null,
    sellerFooterNote: settings?.invoiceFooter || null,
    returnPolicyNote: settings?.returnPolicy || null,
  };
}

async function getOrderSnapshot(
  tx: Prisma.TransactionClient | typeof prisma,
  orderId: number,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: { id: "asc" } },
      user: { select: { displayName: true, email: true, phone: true } },
    },
  });
  if (!order) throw new Error("Đơn hàng không còn tồn tại.");

  const subtotal = order.items.reduce(
    (sum, item) => sum.plus(decimal(item.lineSubtotal)),
    new Prisma.Decimal(0),
  );
  const expectedTotal = subtotal
    .minus(decimal(order.discountAmount))
    .plus(decimal(order.shippingFee))
    .plus(decimal(order.taxAmount));
  if (!expectedTotal.equals(decimal(order.totalAmount))) {
    throw new Error(
      "Dữ liệu đơn hàng không hợp lệ, không thể phát hành hóa đơn.",
    );
  }

  const seller = await getSellerSnapshot(tx);
  const customerName = order.receiverName || order.user?.displayName || null;
  const customerPhone = order.receiverPhone || order.user?.phone || null;
  const shippingAddress =
    [
      order.receiverAddress,
      order.receiverWard,
      order.receiverDistrict,
      order.receiverProvince,
    ]
      .filter(Boolean)
      .join(", ") || null;

  return {
    order,
    seller,
    subtotal,
    customerName,
    customerPhone,
    shippingAddress,
  };
}

function mapInvoice(invoice: InvoiceWithRelations) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    version: invoice.version,
    status: invoice.status,
    publicToken: invoice.publicAccessEnabled ? invoice.publicToken : null,
    publicUrl:
      invoice.publicAccessEnabled && invoice.publicToken
        ? publicUrl(invoice.publicToken)
        : null,
    isPrimary: invoice.isPrimary,
    order: {
      id: invoice.orderId,
      orderNumber: invoice.orderCodeSnapshot,
      source: invoice.orderSourceSnapshot,
      status: invoice.orderStatusSnapshot,
      placedAt: invoice.sourceUpdatedAtSnapshot,
    },
    seller: {
      name: invoice.sellerName,
      phone: invoice.sellerPhone,
      email: invoice.sellerEmail,
      address: invoice.sellerAddress,
      logoUrl: invoice.sellerLogoUrl,
      taxCode: invoice.sellerTaxCode,
      footerNote: invoice.sellerFooterNote,
      returnPolicy: invoice.returnPolicyNote,
    },
    customer: {
      name: invoice.customerName || "Khách lẻ",
      phone: invoice.customerPhone,
      email: invoice.customerEmail,
      address: invoice.shippingAddress,
    },
    items: invoice.items.map((item, index) => ({
      index: index + 1,
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      colorName: item.colorName,
      sizeName: item.sizeName,
      sku: item.sku,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      lineDiscount: toNumber(item.lineDiscount),
      lineTotal: toNumber(item.lineTotal),
    })),
    subtotal: toNumber(invoice.subtotal),
    discountAmount: toNumber(invoice.discountAmount),
    shippingFee: toNumber(invoice.shippingFee),
    taxAmount: toNumber(invoice.taxAmount),
    totalAmount: toNumber(invoice.totalAmount),
    couponCode: invoice.couponCodeSnapshot,
    note: invoice.note,
    paymentMethod: invoice.paymentMethodSnapshot,
    paymentStatus: invoice.paymentStatusSnapshot,
    issuedAt: invoice.issuedAt,
    issuedBy: invoice.issuedBy,
    voidedAt: invoice.voidedAt,
    voidedBy: invoice.voidedBy,
    voidReason: invoice.voidReason,
    sourceUpdatedAt: invoice.sourceUpdatedAtSnapshot,
  };
}

export async function previewInvoice(orderId: number) {
  const snapshot = await getOrderSnapshot(prisma, orderId);
  return {
    status: "DRAFT" as const,
    invoiceNumber: null,
    order: {
      id: snapshot.order.id,
      orderNumber: snapshot.order.orderNumber,
      source: snapshot.order.source,
      status: snapshot.order.status,
      placedAt: snapshot.order.updatedAt,
    },
    seller: snapshot.seller,
    customer: {
      name: snapshot.customerName || "Khách lẻ",
      phone: snapshot.customerPhone,
      email: snapshot.order.user?.email || null,
      address: snapshot.shippingAddress,
    },
    items: snapshot.order.items.map((item, index) => ({
      index: index + 1,
      productName: item.productTitle,
      variantName: [item.color, item.size].filter(Boolean).join(" / ") || null,
      sku: item.sku,
      imageUrl: item.productImageUrl,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      lineDiscount:
        Math.max(
          0,
          toNumber(item.originalUnitPrice) - toNumber(item.unitPrice),
        ) * item.quantity,
      lineTotal: toNumber(item.totalPrice),
    })),
    subtotal: snapshot.subtotal.toNumber(),
    discountAmount: toNumber(snapshot.order.discountAmount),
    shippingFee: toNumber(snapshot.order.shippingFee),
    taxAmount: toNumber(snapshot.order.taxAmount),
    totalAmount: toNumber(snapshot.order.totalAmount),
    couponCode: snapshot.order.discountCodeSnapshot,
    note: snapshot.order.note,
    paymentMethod: snapshot.order.paymentMethod,
    paymentStatus: snapshot.order.paymentStatus,
    issuedAt: null,
    sourceUpdatedAt: snapshot.order.updatedAt,
  };
}

export async function issueInvoice(
  orderId: number,
  adminId: number,
  reissueReason?: string,
) {
  const invoice = await prisma.$transaction(async (tx) => {
    const current = await tx.orderInvoice.findFirst({
      where: { orderId, status: "ISSUED", isPrimary: true },
      orderBy: { version: "desc" },
    });
    if (current && !reissueReason) {
      throw new Error("Hóa đơn đã được phát hành trước đó.");
    }
    if (current) {
      await tx.orderInvoice.update({
        where: { id: current.id },
        data: {
          status: "VOIDED",
          isPrimary: false,
          voidedAt: new Date(),
          voidedById: adminId,
          voidReason: reissueReason,
        },
      });
    }

    const snapshot = await getOrderSnapshot(tx, orderId);
    const latest = await tx.orderInvoice.findFirst({
      where: { orderId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const version = (latest?.version || 0) + 1;
    const parts = vietnamDateParts(new Date());
    const sequenceKey = `invoice-${parts.year}`;
    await tx.invoiceSequence.upsert({
      where: { key: sequenceKey },
      create: { key: sequenceKey, value: 0 },
      update: {},
    });
    const sequence = await tx.invoiceSequence.update({
      where: { key: sequenceKey },
      data: { value: { increment: 1 } },
      select: { value: true },
    });
    const invoiceNumber = `QN-${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}-${String(sequence.value).padStart(4, "0")}`;
    const created = await tx.orderInvoice.create({
      data: {
        orderId,
        invoiceNumber,
        version,
        status: "ISSUED",
        publicToken: makePublicToken(),
        orderCodeSnapshot: snapshot.order.orderNumber,
        orderSourceSnapshot: snapshot.order.source,
        orderStatusSnapshot: snapshot.order.status,
        paymentMethodSnapshot: snapshot.order.paymentMethod,
        paymentStatusSnapshot: snapshot.order.paymentStatus,
        ...snapshot.seller,
        customerName: snapshot.customerName,
        customerPhone: snapshot.customerPhone,
        customerEmail: snapshot.order.user?.email || null,
        shippingAddress: snapshot.shippingAddress,
        subtotal: snapshot.subtotal,
        discountAmount: snapshot.order.discountAmount,
        shippingFee: snapshot.order.shippingFee,
        taxAmount: snapshot.order.taxAmount,
        totalAmount: snapshot.order.totalAmount,
        couponCodeSnapshot: snapshot.order.discountCodeSnapshot,
        note: snapshot.order.note,
        issuedAt: new Date(),
        issuedById: adminId,
        sourceUpdatedAtSnapshot: snapshot.order.updatedAt,
        items: {
          create: snapshot.order.items.map((item) => ({
            orderItemId: item.id,
            productName: item.productTitle,
            variantName:
              [item.color, item.size].filter(Boolean).join(" / ") || null,
            colorName: item.color,
            sizeName: item.size,
            sku: item.sku,
            imageUrl: item.productImageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineDiscount: decimal(item.originalUnitPrice)
              .minus(decimal(item.unitPrice))
              .mul(item.quantity),
            lineTotal: item.totalPrice,
          })),
        },
      },
      include: invoiceInclude,
    });
    return created;
  });
  return mapInvoice(invoice);
}

export async function getAdminInvoice(invoiceId: number) {
  const invoice = await prisma.orderInvoice.findUnique({
    where: { id: invoiceId },
    include: invoiceInclude,
  });
  if (!invoice) throw new Error("Không tìm thấy hóa đơn.");
  return mapInvoice(invoice);
}

export async function getPublicInvoice(token: string) {
  const invoice = await prisma.orderInvoice.findUnique({
    where: { publicToken: token },
    include: invoiceInclude,
  });
  if (!invoice || !invoice.publicAccessEnabled)
    throw new Error("Không tìm thấy hóa đơn.");
  return mapInvoice(invoice);
}

export async function voidInvoice(
  invoiceId: number,
  adminId: number,
  reason: string,
) {
  if (!reason.trim()) throw new Error("Vui lòng nhập lý do hủy hóa đơn.");
  const invoice = await prisma.orderInvoice.findUnique({
    where: { id: invoiceId },
  });
  if (!invoice) throw new Error("Không tìm thấy hóa đơn.");
  if (invoice.status !== "ISSUED")
    throw new Error("Chỉ có thể hủy hóa đơn đã phát hành.");
  const updated = await prisma.orderInvoice.update({
    where: { id: invoiceId },
    data: {
      status: "VOIDED",
      isPrimary: false,
      voidedAt: new Date(),
      voidedById: adminId,
      voidReason: reason.trim(),
    },
    include: invoiceInclude,
  });
  return mapInvoice(updated);
}
