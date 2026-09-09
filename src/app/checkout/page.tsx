import CheckoutClient from "@/components/Storefront/CheckoutClient";
import { Suspense } from "react";

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#FAF8F8]" />}><CheckoutClient /></Suspense>;
}
