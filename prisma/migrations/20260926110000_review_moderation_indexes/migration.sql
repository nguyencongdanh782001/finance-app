CREATE INDEX "review_productId_isApproved_createdAt_idx" ON "review"("productId", "isApproved", "createdAt");

CREATE INDEX "review_isApproved_updatedAt_idx" ON "review"("isApproved", "updatedAt");
