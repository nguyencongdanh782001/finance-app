-- Add a cash payment method for physical-store orders.
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'CASH';

-- Extend orders with server-calculated cost/profit and creator tracking.
ALTER TABLE "order"
ADD COLUMN IF NOT EXISTS "createdById" INTEGER,
ADD COLUMN IF NOT EXISTS "updatedById" INTEGER,
ADD COLUMN IF NOT EXISTS "totalCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "profit" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Extend order items with immutable sale snapshots.
ALTER TABLE "order_item"
ADD COLUMN IF NOT EXISTS "productImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "originalUnitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lineSubtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lineCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lineProfit" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill snapshots for historical rows from existing totals.
UPDATE "order_item"
SET
  "originalUnitPrice" = CASE
    WHEN "originalUnitPrice" = 0 THEN "unitPrice"
    ELSE "originalUnitPrice"
  END,
  "lineSubtotal" = CASE
    WHEN "lineSubtotal" = 0 THEN "totalPrice"
    ELSE "lineSubtotal"
  END;

UPDATE "order_item" oi
SET
  "unitCost" = COALESCE(p."importPrice", oi."unitCost"),
  "productImageUrl" = COALESCE(oi."productImageUrl", p."imageUrl")
FROM "product" p
WHERE oi."productId" = p."id";

UPDATE "order_item"
SET
  "lineCost" = "unitCost" * "quantity",
  "lineProfit" = "lineSubtotal" - ("unitCost" * "quantity");

UPDATE "order" o
SET
  "totalCost" = COALESCE(items."totalCost", 0),
  "profit" = o."totalAmount" - COALESCE(items."totalCost", 0),
  "completedAt" = CASE
    WHEN o."status" = 'COMPLETED' AND o."completedAt" IS NULL THEN o."placedAt"
    ELSE o."completedAt"
  END
FROM (
  SELECT
    "orderId",
    SUM("lineCost") AS "totalCost"
  FROM "order_item"
  GROUP BY "orderId"
) items
WHERE o."id" = items."orderId";

-- Allow historical order items to survive product deletion.
ALTER TABLE "order_item"
DROP CONSTRAINT IF EXISTS "order_item_productId_fkey";

ALTER TABLE "order_item"
ALTER COLUMN "productId" DROP NOT NULL;

ALTER TABLE "order_item"
ADD CONSTRAINT "order_item_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order"
ADD CONSTRAINT "order_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order"
ADD CONSTRAINT "order_updatedById_fkey"
FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "order_createdById_idx" ON "order"("createdById");
CREATE INDEX IF NOT EXISTS "order_updatedById_idx" ON "order"("updatedById");
CREATE INDEX IF NOT EXISTS "order_placedAt_idx" ON "order"("placedAt");
CREATE INDEX IF NOT EXISTS "order_completedAt_idx" ON "order"("completedAt");
