ALTER TABLE "product_variant"
ADD COLUMN "colorCode" TEXT;

CREATE INDEX "product_variant_colorCode_idx"
ON "product_variant"("colorCode");
