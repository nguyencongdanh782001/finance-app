ALTER TABLE "order" ADD COLUMN "shippingDistanceMeters" INTEGER;
ALTER TABLE "order" ADD COLUMN "shippingDistanceKm" DECIMAL(65,30);
ALTER TABLE "order" ADD COLUMN "shippingEstimatedMinutes" INTEGER;
