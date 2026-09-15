CREATE TYPE "ShippingDistanceRoundingMode" AS ENUM ('EXACT', 'UP_TO_0_5_KM', 'UP_TO_1_KM');

CREATE TABLE "shipping_configuration" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "shopName" TEXT,
  "formattedAddress" TEXT,
  "streetAddress" TEXT,
  "ward" TEXT,
  "district" TEXT,
  "province" TEXT,
  "latitude" DECIMAL,
  "longitude" DECIMAL,
  "placeId" TEXT,
  "baseFee" INTEGER NOT NULL DEFAULT 10000,
  "pricePerKm" INTEGER NOT NULL DEFAULT 5000,
  "maximumDeliveryDistanceKm" DECIMAL NOT NULL DEFAULT 30,
  "distanceRoundingMode" "ShippingDistanceRoundingMode" NOT NULL DEFAULT 'UP_TO_0_5_KM',
  "feeRoundingStep" INTEGER NOT NULL DEFAULT 1000,
  "minimumShippingFee" INTEGER,
  "maximumShippingFee" INTEGER,
  "updatedById" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipping_configuration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipping_promotion" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "minimumOrderValue" INTEGER NOT NULL,
  "freeDistanceKm" DECIMAL NOT NULL,
  "maximumShippingDiscount" INTEGER,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdById" INTEGER,
  "updatedById" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipping_promotion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shipping_promotion_isActive_startsAt_endsAt_idx" ON "shipping_promotion"("isActive", "startsAt", "endsAt");
CREATE INDEX "shipping_promotion_minimumOrderValue_idx" ON "shipping_promotion"("minimumOrderValue");

ALTER TABLE "order" ADD COLUMN "shippingOriginAddress" TEXT;
ALTER TABLE "order" ADD COLUMN "shippingOriginLatitude" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingOriginLongitude" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingDestinationLatitude" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingDestinationLongitude" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingRawDistanceMeters" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingRoundedDistanceKm" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingFreeDistanceKm" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingChargeableDistanceKm" DECIMAL;
ALTER TABLE "order" ADD COLUMN "shippingBaseFee" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingPricePerKm" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingFeeBeforePromotion" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingDiscount" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingPromotionId" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingPromotionName" TEXT;
ALTER TABLE "order" ADD COLUMN "shippingQuoteProvider" TEXT;
ALTER TABLE "order" ADD COLUMN "shippingCalculatedAt" TIMESTAMP(3);
CREATE INDEX "order_shippingPromotionId_idx" ON "order"("shippingPromotionId");
ALTER TABLE "order" ADD CONSTRAINT "order_shippingPromotionId_fkey" FOREIGN KEY ("shippingPromotionId") REFERENCES "shipping_promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
