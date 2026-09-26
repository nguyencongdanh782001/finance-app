CREATE TABLE "product_view_event" (
    "id" SERIAL NOT NULL,
    "visitorId" TEXT,
    "userId" INTEGER,
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "dedupeKey" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_view_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_view_event_dedupeKey_key" ON "product_view_event"("dedupeKey");
CREATE INDEX "product_view_event_visitorId_productId_viewedAt_idx" ON "product_view_event"("visitorId", "productId", "viewedAt");
CREATE INDEX "product_view_event_userId_viewedAt_idx" ON "product_view_event"("userId", "viewedAt");
CREATE INDEX "product_view_event_categoryId_viewedAt_idx" ON "product_view_event"("categoryId", "viewedAt");
CREATE INDEX "product_view_event_viewedAt_idx" ON "product_view_event"("viewedAt");

ALTER TABLE "product_view_event" ADD CONSTRAINT "product_view_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_view_event" ADD CONSTRAINT "product_view_event_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_view_event" ADD CONSTRAINT "product_view_event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
