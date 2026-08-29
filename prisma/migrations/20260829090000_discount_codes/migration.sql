ALTER TABLE "coupon" ADD COLUMN "normalizedCode" TEXT;
ALTER TABLE "coupon" ADD COLUMN "publicToken" TEXT;

UPDATE "coupon"
SET "normalizedCode" = upper(regexp_replace("code", '\s+', '', 'g')),
    "publicToken" = md5(random()::text || clock_timestamp()::text || "id"::text)
WHERE "normalizedCode" IS NULL OR "publicToken" IS NULL;

ALTER TABLE "coupon" ALTER COLUMN "normalizedCode" SET NOT NULL;
ALTER TABLE "coupon" ALTER COLUMN "publicToken" SET NOT NULL;
CREATE UNIQUE INDEX "coupon_normalizedCode_key" ON "coupon"("normalizedCode");
CREATE UNIQUE INDEX "coupon_publicToken_key" ON "coupon"("publicToken");

ALTER TABLE "order" ADD COLUMN "discountCodeSnapshot" TEXT;

CREATE TABLE "discount_redemption" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "codeSnapshot" TEXT NOT NULL,
    "discountTypeSnapshot" "CouponType" NOT NULL,
    "discountValueSnapshot" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30) NOT NULL,
    "subtotalSnapshot" DECIMAL(65,30) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discount_redemption_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "discount_redemption_orderId_key" ON "discount_redemption"("orderId");
CREATE INDEX "discount_redemption_couponId_idx" ON "discount_redemption"("couponId");
ALTER TABLE "discount_redemption" ADD CONSTRAINT "discount_redemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discount_redemption" ADD CONSTRAINT "discount_redemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
