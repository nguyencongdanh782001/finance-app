-- Make inventory transactions support both base products and variants.
-- Existing variant transactions are preserved and backfilled with productId.
ALTER TABLE "inventory_transaction"
  ADD COLUMN IF NOT EXISTS "productId" INTEGER;

UPDATE "inventory_transaction" AS inventory_transaction
SET "productId" = product_variant."productId"
FROM "product_variant"
WHERE inventory_transaction."variantId" = product_variant."id"
  AND inventory_transaction."productId" IS NULL;

ALTER TABLE "inventory_transaction"
  ALTER COLUMN "variantId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "inventory_transaction_productId_idx"
  ON "inventory_transaction"("productId");

ALTER TABLE "inventory_transaction"
  ADD CONSTRAINT "inventory_transaction_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Client-generated idempotency key for safe offline order retries.
ALTER TABLE "order"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "order_idempotencyKey_key"
  ON "order"("idempotencyKey");
