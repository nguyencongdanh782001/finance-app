import StorefrontHomeClient from "@/components/Home/StorefrontHomeClient";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Quỳnh Nhi Store | Thời trang nữ hiện đại",
  description:
    "Khám phá những thiết kế thời trang nữ hiện đại, dễ mặc và phù hợp cho mọi phong cách tại Quỳnh Nhi Store.",
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Quỳnh Nhi Store",
  url: siteUrl,
  logo: new URL("/logo-quynh-nhi-store.svg", siteUrl).toString(),
  image: new URL("/icons/icon-512.png", siteUrl).toString(),
  sameAs: [],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StorefrontHomeClient />
    </>
  );
}
