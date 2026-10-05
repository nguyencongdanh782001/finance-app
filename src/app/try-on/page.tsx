import VirtualTryOnClient from "@/components/Storefront/VirtualTryOnClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thử đồ AI | Quỳnh Nhi Store",
  description:
    "Tải ảnh toàn thân và xem thử các thiết kế thời trang của Quỳnh Nhi Store.",
  alternates: { canonical: "/try-on" },
};

export default function TryOnPage() {
  return <VirtualTryOnClient />;
}
