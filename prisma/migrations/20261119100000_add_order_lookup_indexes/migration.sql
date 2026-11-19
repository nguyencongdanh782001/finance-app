CREATE INDEX IF NOT EXISTS "order_paymentStatus_placedAt_idx"
ON "order" ("paymentStatus", "placedAt");

CREATE INDEX IF NOT EXISTS "order_source_status_placedAt_idx"
ON "order" ("source", "status", "placedAt");
