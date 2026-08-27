CREATE TABLE IF NOT EXISTS "daily_sold_product_contribution" (
    "id" SERIAL NOT NULL,
    "dailyFinanceId" INTEGER NOT NULL,
    "dailySoldProductId" INTEGER,
    "orderId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "sellPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_sold_product_contribution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "daily_sold_product_contribution_orderItemId_key"
ON "daily_sold_product_contribution"("orderItemId");

CREATE INDEX IF NOT EXISTS "daily_sold_product_contribution_dailyFinanceId_idx"
ON "daily_sold_product_contribution"("dailyFinanceId");

CREATE INDEX IF NOT EXISTS "daily_sold_product_contribution_dailySoldProductId_idx"
ON "daily_sold_product_contribution"("dailySoldProductId");

CREATE INDEX IF NOT EXISTS "daily_sold_product_contribution_orderId_idx"
ON "daily_sold_product_contribution"("orderId");

CREATE INDEX IF NOT EXISTS "daily_sold_product_contribution_productId_idx"
ON "daily_sold_product_contribution"("productId");

CREATE INDEX IF NOT EXISTS "daily_sold_product_contribution_variantId_idx"
ON "daily_sold_product_contribution"("variantId");

ALTER TABLE "daily_sold_product_contribution"
ADD CONSTRAINT "daily_sold_product_contribution_dailyFinanceId_fkey"
FOREIGN KEY ("dailyFinanceId") REFERENCES "daily_finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "daily_sold_product_contribution"
ADD CONSTRAINT "daily_sold_product_contribution_dailySoldProductId_fkey"
FOREIGN KEY ("dailySoldProductId") REFERENCES "daily_sold_product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "daily_sold_product_contribution"
ADD CONSTRAINT "daily_sold_product_contribution_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "daily_sold_product_contribution"
ADD CONSTRAINT "daily_sold_product_contribution_orderItemId_fkey"
FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "daily_sold_product_contribution"
ADD CONSTRAINT "daily_sold_product_contribution_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "daily_sold_product_contribution"
ADD CONSTRAINT "daily_sold_product_contribution_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
