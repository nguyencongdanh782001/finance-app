CREATE INDEX IF NOT EXISTS "product_status_categoryId_idx" ON "product"("status", "categoryId");
CREATE INDEX IF NOT EXISTS "product_status_createdAt_idx" ON "product"("status", "createdAt");
