CREATE TYPE "ProductDraftMode" AS ENUM ('CREATE', 'EDIT');
CREATE TYPE "ProductDraftStatus" AS ENUM ('ACTIVE', 'APPLIED', 'DISCARDED');

CREATE TABLE "product_draft" (
    "id" SERIAL NOT NULL,
    "mode" "ProductDraftMode" NOT NULL,
    "status" "ProductDraftStatus" NOT NULL DEFAULT 'ACTIVE',
    "originalProductId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "currentStep" TEXT,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "appliedAt" TIMESTAMP(3),
    "discardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_draft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_draft_createdById_status_idx" ON "product_draft"("createdById", "status");
CREATE INDEX "product_draft_originalProductId_status_idx" ON "product_draft"("originalProductId", "status");
ALTER TABLE "product_draft" ADD CONSTRAINT "product_draft_originalProductId_fkey" FOREIGN KEY ("originalProductId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_draft" ADD CONSTRAINT "product_draft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
