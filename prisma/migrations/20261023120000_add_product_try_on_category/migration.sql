CREATE TYPE "TryOnCategory" AS ENUM ('UPPER_BODY', 'LOWER_BODY', 'DRESSES', 'SHOES', 'ACCESSORIES', 'NOT_SUPPORTED');

ALTER TABLE "category" ADD COLUMN "tryOnCategory" "TryOnCategory" NOT NULL DEFAULT 'NOT_SUPPORTED';

CREATE INDEX "category_tryOnCategory_idx" ON "category"("tryOnCategory");
