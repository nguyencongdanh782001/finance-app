import { Suspense } from "react";
import ProductWizard from "@/components/Product/ProductWizard";
export default function NewProductPage() { return <Suspense><ProductWizard mode="CREATE" /></Suspense>; }
