import { Suspense } from "react";
import CategoryContainer from "@/container/CategoryContainer";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CategoryContainer />
    </Suspense>
  );
}
