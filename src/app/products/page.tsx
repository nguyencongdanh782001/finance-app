import ProductListingClient from "@/components/Storefront/ProductListingClient";
import { Suspense } from "react";
export const metadata = { title: "Sản phẩm | Quỳnh Nhi Store", description: "Khám phá sản phẩm thời trang tại Quỳnh Nhi Store" };
export default function ProductsPage() { return <Suspense fallback={<div className="min-h-screen bg-[#FFFCFA]" />}><ProductListingClient /></Suspense>; }
