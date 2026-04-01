-- CreateTable
CREATE TABLE "daily_sold_product" (
    "id" SERIAL NOT NULL,
    "dailyFinanceId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_sold_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_sold_product_dailyFinanceId_productId_key" ON "daily_sold_product"("dailyFinanceId", "productId");

-- CreateIndex
CREATE INDEX "daily_sold_product_dailyFinanceId_idx" ON "daily_sold_product"("dailyFinanceId");

-- CreateIndex
CREATE INDEX "daily_sold_product_productId_idx" ON "daily_sold_product"("productId");

-- AddForeignKey
ALTER TABLE "daily_sold_product" ADD CONSTRAINT "daily_sold_product_dailyFinanceId_fkey" FOREIGN KEY ("dailyFinanceId") REFERENCES "daily_finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_sold_product" ADD CONSTRAINT "daily_sold_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
