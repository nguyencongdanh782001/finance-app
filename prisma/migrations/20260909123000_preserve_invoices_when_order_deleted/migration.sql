ALTER TABLE "order_invoice" DROP CONSTRAINT "order_invoice_orderId_fkey";
ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
