CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'VOIDED');

CREATE TABLE "order_invoice" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "publicToken" TEXT,
    "publicAccessEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "orderCodeSnapshot" TEXT NOT NULL,
    "orderSourceSnapshot" "OrderSource" NOT NULL,
    "orderStatusSnapshot" "OrderStatus" NOT NULL,
    "paymentMethodSnapshot" "PaymentMethod",
    "paymentStatusSnapshot" "PaymentStatus",
    "sellerName" TEXT,
    "sellerPhone" TEXT,
    "sellerEmail" TEXT,
    "sellerAddress" TEXT,
    "sellerLogoUrl" TEXT,
    "sellerTaxCode" TEXT,
    "sellerFooterNote" TEXT,
    "returnPolicyNote" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "shippingAddress" TEXT,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shippingFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "couponCodeSnapshot" TEXT,
    "note" TEXT,
    "issuedAt" TIMESTAMP(3),
    "issuedById" INTEGER,
    "voidedAt" TIMESTAMP(3),
    "voidedById" INTEGER,
    "voidReason" TEXT,
    "sourceUpdatedAtSnapshot" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "order_invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_invoice_item" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "orderItemId" INTEGER,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "colorName" TEXT,
    "sizeName" TEXT,
    "sku" TEXT,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "lineDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    CONSTRAINT "order_invoice_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_sequence" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoice_sequence_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "store_setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "storeName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "taxCode" TEXT,
    "invoiceFooter" TEXT,
    "returnPolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "store_setting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "order_invoice_invoiceNumber_key" ON "order_invoice"("invoiceNumber");
CREATE UNIQUE INDEX "order_invoice_publicToken_key" ON "order_invoice"("publicToken");
CREATE UNIQUE INDEX "order_invoice_orderId_version_key" ON "order_invoice"("orderId", "version");
CREATE INDEX "order_invoice_orderId_status_idx" ON "order_invoice"("orderId", "status");
CREATE INDEX "order_invoice_issuedAt_idx" ON "order_invoice"("issuedAt");
CREATE INDEX "order_invoice_item_invoiceId_idx" ON "order_invoice_item"("invoiceId");
CREATE UNIQUE INDEX "order_invoice_one_primary_issued_idx" ON "order_invoice"("orderId") WHERE "status" = 'ISSUED' AND "isPrimary" = true;

ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_invoice_item" ADD CONSTRAINT "order_invoice_item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "order_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_invoice_item" ADD CONSTRAINT "order_invoice_item_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
