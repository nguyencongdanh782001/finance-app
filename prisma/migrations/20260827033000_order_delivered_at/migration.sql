ALTER TABLE "order"
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);

UPDATE "order"
SET "deliveredAt" = "completedAt"
WHERE "source" = 'ONLINE'
  AND "status" = 'DELIVERED'
  AND "deliveredAt" IS NULL
  AND "completedAt" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "order_deliveredAt_idx"
  ON "order"("deliveredAt");
