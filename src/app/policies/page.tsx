import Link from "next/link";
import prisma from "@/lib/db";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import PolicyHubClient, {
  type PublicPolicy,
} from "@/components/Storefront/PolicyHubClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách cửa hàng | Quỳnh Nhi Store",
  description:
    "Thông tin về mua hàng, thanh toán, vận chuyển và đổi trả tại Quỳnh Nhi Store.",
  alternates: { canonical: "/policies" },
  openGraph: {
    title: "Chính sách cửa hàng | Quỳnh Nhi Store",
    description:
      "Thông tin về mua hàng, thanh toán, vận chuyển và đổi trả tại Quỳnh Nhi Store.",
    url: "/policies",
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

export default async function PoliciesPage() {
  let policies: Array<{
    title: string;
    slug: string;
    summary: string | null;
    summaryHtml: string | null;
    summaryText: string | null;
    content: unknown;
    contentHtml: string | null;
    updatedAt: Date;
    footerOrder: number;
  }> = [];
  let queryError = false;
  try {
    policies = await prisma.storePolicy.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ footerOrder: "asc" }, { title: "asc" }],
      select: {
        title: true,
        slug: true,
        summary: true,
        summaryHtml: true,
        summaryText: true,
        content: true,
        contentHtml: true,
        updatedAt: true,
        footerOrder: true,
      },
    });
  } catch (error) {
    console.error("Public policies page failed", error);
    queryError = true;
  }
  const publicPolicies: PublicPolicy[] = policies.map((policy) => ({
    title: policy.title,
    slug: policy.slug,
    summaryHtml: policy.summaryHtml || policy.summary || null,
    summaryText: policy.summaryText || policy.summary || null,
    contentHtml:
      policy.contentHtml ||
      (typeof policy.content === "object" &&
      policy.content &&
      "html" in policy.content
        ? String((policy.content as { html?: unknown }).html || "")
        : ""),
    updatedAt: policy.updatedAt.toISOString(),
    footerOrder: policy.footerOrder,
  }));

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <nav
          className="mb-8 text-sm font-semibold text-[#8A7B81]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition hover:text-[#A43E5F]">
            Trang chủ
          </Link>
          <span className="px-2">/</span> Chính sách
        </nav>
        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#D96C8A]">
            Thông tin cửa hàng
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#2D2226] sm:text-5xl">
            Chính sách cửa hàng
          </h1>
          <p className="mt-4 text-base leading-7 text-[#7A6C72]">
            Thông tin về mua hàng, thanh toán, vận chuyển và đổi trả tại Quỳnh
            Nhi Store.
          </p>
        </header>
        <PolicyHubClient policies={publicPolicies} error={queryError} />
      </main>
    </StorefrontShell>
  );
}
