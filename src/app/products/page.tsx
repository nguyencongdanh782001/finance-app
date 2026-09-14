import ProductListingClient from "@/components/Storefront/ProductListingClient";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm | Quỳnh Nhi Store",
  description: "Khám phá sản phẩm thời trang tại Quỳnh Nhi Store.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Sản phẩm | Quỳnh Nhi Store",
    description: "Khám phá sản phẩm thời trang tại Quỳnh Nhi Store.",
    url: "/products",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Quỳnh Nhi Store",
      },
    ],
  },
};
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFCFA]" />}>
      <ProductListingClient />
    </Suspense>
  );
}
