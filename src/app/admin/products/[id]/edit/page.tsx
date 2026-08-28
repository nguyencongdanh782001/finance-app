import { Suspense } from "react";
import ProductWizard from "@/components/Product/ProductWizard";
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) { return <Suspense><ProductWizard mode="EDIT" productId={Number((await params).id)} /></Suspense>; }
