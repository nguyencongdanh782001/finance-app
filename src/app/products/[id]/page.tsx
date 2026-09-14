import ProductDetailClient from "@/components/Storefront/ProductDetailClient";
import prisma from "@/lib/db";
import { meaningfulText } from "@/lib/rich-text";
import type { Metadata } from "next";
import { Suspense } from "react";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = (
  process.env.NODE_ENV === "production" &&
  configuredSiteUrl?.includes("localhost")
    ? "https://quynhnhistore.com"
    : configuredSiteUrl || "https://quynhnhistore.com"
).replace(/\/$/, "");
const defaultImage = "/icons/icon-512.png";

const absoluteUrl = (value: string) => new URL(value, siteUrl).toString();

async function getPublicProduct(identifier: string) {
  const numericId = Number(identifier);
  try {
    return await prisma.product.findFirst({
      where: {
        status: "PUBLIC",
        ...(Number.isInteger(numericId)
          ? { OR: [{ id: numericId }, { slug: identifier }] }
          : { slug: identifier }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        descriptionHtml: true,
        imageUrl: true,
        sellPrice: true,
        quantity: true,
        category: { select: { name: true } },
        images: {
          where: { variantId: null },
          orderBy: { position: "asc" },
          select: { url: true, altText: true },
        },
        variants: {
          where: { isActive: true },
          select: { quantity: true, reservedQuantity: true },
        },
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Product SEO metadata failed", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProduct(id);
  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | Quỳnh Nhi Store",
      robots: { index: false, follow: false },
    };
  }

  const description =
    meaningfulText(product.descriptionHtml || product.description || "") ||
    `Khám phá ${product.title} tại Quỳnh Nhi Store.`;
  const image = product.images[0]?.url || product.imageUrl || defaultImage;
  const canonical = `/products/${product.slug || product.id}`;
  const absoluteImage = absoluteUrl(image);
  const absoluteCanonical = absoluteUrl(canonical);

  return {
    title: `${product.title} | Quỳnh Nhi Store`,
    description: description.slice(0, 160),
    keywords: [
      product.title,
      product.category.name,
      "Quỳnh Nhi Store",
      "thời trang",
    ],
    alternates: { canonical: absoluteCanonical },
    openGraph: {
      type: "website",
      title: `${product.title} | Quỳnh Nhi Store`,
      description: description.slice(0, 200),
      url: absoluteCanonical,
      siteName: "Quỳnh Nhi Store",
      images: [
        {
          url: absoluteImage,
          alt: product.images[0]?.altText || product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Quỳnh Nhi Store`,
      description: description.slice(0, 200),
      images: [absoluteImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProduct(id);
  const image = product?.images[0]?.url || product?.imageUrl || defaultImage;
  const hasStock = product
    ? product.variants.some(
        (variant) => variant.quantity - variant.reservedQuantity > 0,
      ) || product.quantity > 0
    : false;
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: meaningfulText(
          product.descriptionHtml || product.description || "",
        ),
        image: [absoluteUrl(image)],
        url: absoluteUrl(`/products/${product.slug || product.id}`),
        category: product.category.name,
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: Number(product.sellPrice),
          availability: `https://schema.org/${hasStock ? "InStock" : "OutOfStock"}`,
          url: absoluteUrl(`/products/${product.slug || product.id}`),
          seller: { "@type": "Organization", name: "Quỳnh Nhi Store" },
        },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <Suspense fallback={<div className="min-h-screen bg-[#FFFCFA]" />}>
        <ProductDetailClient />
      </Suspense>
    </>
  );
}
