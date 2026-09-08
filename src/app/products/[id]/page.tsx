import ProductDetailClient from "@/components/Storefront/ProductDetailClient";
import { Suspense } from "react";

export default function ProductDetailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#FFFCFA]" />}><ProductDetailClient /></Suspense>;
}
