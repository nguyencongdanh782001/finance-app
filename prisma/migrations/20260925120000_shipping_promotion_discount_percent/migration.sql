ALTER TABLE "shipping_promotion" RENAME COLUMN "freeDistanceKm" TO "discountPercent";

ALTER TABLE "order" ADD COLUMN "shippingDiscountPercent" DECIMAL;
