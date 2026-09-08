ALTER TABLE "product"
ADD COLUMN "organicFavoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "favoriteCountAdjustment" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "product_favorite_adjustment_log" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "previousAdjustment" INTEGER NOT NULL,
    "newAdjustment" INTEGER NOT NULL,
    "organicCount" INTEGER NOT NULL,
    "previousDisplayCount" INTEGER NOT NULL,
    "newDisplayCount" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_favorite_adjustment_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_favorite_adjustment_log_productId_createdAt_idx"
ON "product_favorite_adjustment_log"("productId", "createdAt");
CREATE INDEX "product_favorite_adjustment_log_adminId_createdAt_idx"
ON "product_favorite_adjustment_log"("adminId", "createdAt");

ALTER TABLE "product_favorite_adjustment_log"
ADD CONSTRAINT "product_favorite_adjustment_log_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_favorite_adjustment_log"
ADD CONSTRAINT "product_favorite_adjustment_log_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
