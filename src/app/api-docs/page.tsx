import { notFound } from "next/navigation";
import SwaggerUi from "./SwaggerUi";
import { isSwaggerEnabled } from "@/lib/swagger";

export const dynamic = "force-dynamic";

export default function ApiDocsPage() {
  if (!isSwaggerEnabled()) {
    notFound();
  }

  return <SwaggerUi />;
}
