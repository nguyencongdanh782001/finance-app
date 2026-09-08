"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { storefrontFooterLinks } from "@/components/Storefront/storefront-navigation";
import { useEffect, useState } from "react";

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <details
      className="group border-b border-[#EAE1E4] py-4 lg:border-0 lg:py-0"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between font-bold lg:cursor-default [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="text-xl font-normal text-[#D96C8A] lg:hidden group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="grid gap-1 pt-2 lg:pt-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-h-7 items-center text-sm text-[#BFB2B6] transition hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export default function StorefrontFooter() {
  const [policies, setPolicies] = useState<
    Array<{ title: string; slug: string }>
  >([]);
  useEffect(() => {
    fetch("/api/policies?footer=true")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { items?: Array<{ title: string; slug: string }> }) =>
        setPolicies(data.items || []),
      )
      .catch(() => undefined);
  }, []);
  return (
    <footer className="mt-20 bg-[#2F2529] text-white">
      <div className="border-b border-white/10 bg-[#FAF8F8] text-[#2D2226]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-7 sm:grid-cols-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Truck className="size-5 shrink-0 text-[#D96C8A]" />
            <div>
              <p className="text-sm font-bold">Giao hàng toàn quốc</p>
              <p className="mt-1 text-xs text-[#6F6066]">Đặt hàng thuận tiện</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="size-5 shrink-0 text-[#D96C8A]" />
            <div>
              <p className="text-sm font-bold">Đổi hàng dễ dàng</p>
              <p className="mt-1 text-xs text-[#6F6066]">
                Theo chính sách cửa hàng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 shrink-0 text-[#D96C8A]" />
            <div>
              <p className="text-sm font-bold">Thanh toán an toàn</p>
              <p className="mt-1 text-xs text-[#6F6066]">COD và MoMo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Heart className="size-5 shrink-0 text-[#D96C8A]" />
            <div>
              <p className="text-sm font-bold">Lưu phong cách riêng</p>
              <p className="mt-1 text-xs text-[#6F6066]">
                Lưu sản phẩm yêu thích
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 items-start lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="inline-flex bg-[#FAF8F8] px-3 py-1.5">
              <Image
                src="/logo-quynh-nhi-store.svg"
                alt="Quỳnh Nhi Store"
                width={348}
                height={130}
                className="h-18 w-auto object-contain"
              />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#BFB2B6]">
              Thời trang hiện đại dành cho mọi phong cách, được lựa chọn để bạn
              tự tin trong từng khoảnh khắc.
            </p>
          </div>
          <div className="grid items-start justify-start gap-3 lg:grid-cols-2 lg:gap-8">
            <FooterGroup title="Khám phá" links={storefrontFooterLinks} />
            <FooterGroup
              title="Hỗ trợ"
              links={[
                { label: "Chính sách cửa hàng", href: "/policies" },
                ...policies.map((policy) => ({
                  label: policy.title,
                  href: `/policies?policy=${encodeURIComponent(policy.slug)}`,
                })),
              ]}
            />
          </div>
          <div>
            <p className="font-bold">Quỳnh Nhi Store</p>
            <p className="mt-4 text-sm leading-7 text-[#BFB2B6]">
              Theo dõi những sản phẩm mới và cảm hứng phối đồ trên các kênh
              chính thức của cửa hàng.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex min-h-11 items-center border border-white/25 px-5 text-sm font-bold transition hover:border-[#F4B5C5] hover:text-[#F4B5C5]"
            >
              Khám phá bộ sưu tập
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[#BFB2B6] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} Quỳnh Nhi Store. Bảo lưu mọi quyền.
          </span>
          <span>Thanh toán: COD · MoMo</span>
        </div>
      </div>
    </footer>
  );
}
