-- Stage 1 keeps the legacy columns available for rollback while all new code
-- reads and writes the new product.status field while dual-writing legacy fields.
ALTER TYPE "ProductStatus" RENAME TO "LegacyProductStatus";
ALTER TYPE "ProductVisibility" RENAME TO "LegacyProductVisibility";

CREATE TYPE "ProductStatus" AS ENUM ('PUBLIC', 'PRIVATE', 'DISCONTINUED');
CREATE TYPE "ProductImportStatus" AS ENUM (
  'UPLOADED',
  'VALIDATING',
  'READY',
  'PROCESSING',
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'FAILED'
);
CREATE TYPE "ProductImportMode" AS ENUM ('CREATE_ONLY');

ALTER TABLE "product"
ADD COLUMN "status" "ProductStatus";

UPDATE "product"
SET "status" = CASE
  WHEN "productStatus" = 'ARCHIVED' THEN 'DISCONTINUED'::"ProductStatus"
  WHEN "productStatus" = 'ACTIVE' AND "visibility" = 'PUBLIC' THEN 'PUBLIC'::"ProductStatus"
  WHEN "productStatus" = 'OUT_OF_STOCK' AND "visibility" = 'PUBLIC' THEN 'PUBLIC'::"ProductStatus"
  ELSE 'PRIVATE'::"ProductStatus"
END;

ALTER TABLE "product"
ALTER COLUMN "status" SET DEFAULT 'PRIVATE',
ALTER COLUMN "status" SET NOT NULL;

CREATE INDEX "product_status_idx" ON "product"("status");

CREATE TABLE "product_import_job" (
  "id" TEXT NOT NULL,
  "status" "ProductImportStatus" NOT NULL DEFAULT 'UPLOADED',
  "fileName" TEXT NOT NULL,
  "mode" "ProductImportMode" NOT NULL DEFAULT 'CREATE_ONLY',
  "createMissingCategories" BOOLEAN NOT NULL DEFAULT false,
  "forcePrivate" BOOLEAN NOT NULL DEFAULT false,
  "totalProducts" INTEGER NOT NULL DEFAULT 0,
  "totalVariants" INTEGER NOT NULL DEFAULT 0,
  "totalImages" INTEGER NOT NULL DEFAULT 0,
  "processed" INTEGER NOT NULL DEFAULT 0,
  "succeeded" INTEGER NOT NULL DEFAULT 0,
  "failed" INTEGER NOT NULL DEFAULT 0,
  "skipped" INTEGER NOT NULL DEFAULT 0,
  "sourceData" JSONB,
  "validationErrors" JSONB,
  "resultData" JSONB,
  "processingToken" TEXT,
  "processingStartedAt" TIMESTAMP(3),
  "createdById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "product_import_job_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_import_job_createdById_createdAt_idx"
ON "product_import_job"("createdById", "createdAt");
CREATE INDEX "product_import_job_status_updatedAt_idx"
ON "product_import_job"("status", "updatedAt");

ALTER TABLE "product_import_job"
ADD CONSTRAINT "product_import_job_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
