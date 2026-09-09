-- Restore the partial uniqueness constraint after all historical invoice
-- migrations. IF NOT EXISTS makes this safe for databases where it remains.
CREATE UNIQUE INDEX IF NOT EXISTS "order_invoice_one_primary_issued_idx"
ON "order_invoice"("orderId")
WHERE "status" = 'ISSUED' AND "isPrimary" = true;
