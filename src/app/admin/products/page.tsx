import { Suspense } from "react";
import ProductContainer from "@/container/ProductContainer";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductContainer />
    </Suspense>
  );
}
