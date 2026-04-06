ALTER TABLE "daily_sold_product"
ADD COLUMN "importPrice" DECIMAL NOT NULL DEFAULT 0,
ADD COLUMN "sales" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "daily_sold_product"
DROP COLUMN IF EXISTS "quantity",
DROP COLUMN IF EXISTS "sellPrice";

CREATE UNIQUE INDEX IF NOT EXISTS "daily_sold_product_dailyFinanceId_productId_key"
ON "daily_sold_product"("dailyFinanceId", "productId");
