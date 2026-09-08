"use client";
/* eslint-disable @next/next/no-img-element */

import { useAuth } from "@/components/Auth/AuthProvider";
import ProductCard from "@/components/Storefront/ProductCard";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import type { CategoryApiItem } from "@/interface/category";
import type { ProductApiItem } from "@/interface/product";
import { getDefaultRouteByRole, isAdminRole } from "@/lib/auth/routing";
import { ArrowRight, Check, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Banner = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  desktopImage?: string | null;
  mobileImage?: string | null;
  linkUrl?: string | null;
  eyebrow?: string | null;
  description?: string | null;
  imageAlt?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaUrl?: string | null;
  textAlignment?: "LEFT" | "CENTER" | "RIGHT" | null;
  textTheme?: "LIGHT" | "DARK" | null;
  overlayOpacity?: number | null;
};
type HomepageData = {
  banners: Banner[];
  announcement?: Banner | null;
  newArrivals: ProductApiItem[];
  featuredProducts: Array<{ product: ProductApiItem; title?: string | null }>;
  categories: Array<
    CategoryApiItem & { products?: Array<{ imageUrl: string }> }
  >;
  sections: Array<{
    id: number;
    title: string;
    subtitle?: string | null;
    products: Array<{ product: ProductApiItem }>;
  }>;
};

function ImageWithLoading({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div
        className={`storefront-skeleton flex items-center justify-center bg-[#F3EDEF] text-xs font-semibold text-[#998B91] ${className}`}
      >
        {failed ? "Hình ảnh đang được cập nhật" : null}
      </div>
    );
  return (
    <div className={`relative overflow-hidden bg-[#F3EDEF] ${className}`}>
      <div
        className={`storefront-skeleton absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setReady(true)}
        onError={() => setFailed(true)}
        className={`relative size-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#D96C8A]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl">{title}</h2>
        {subtitle && (
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#6F6066]">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="w-fit text-sm font-bold text-[#A43E5F] hover:text-[#C85B7B]"
        >
          Xem tất cả <ArrowRight className="ml-1 inline size-4" />
        </Link>
      )}
    </div>
  );
}

export default function StorefrontHomeClient() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/homepage")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((value: HomepageData) => setData(value))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (!isInitializing && isAuthenticated && isAdminRole(user?.role))
      router.replace(getDefaultRouteByRole(user?.role));
  }, [isAuthenticated, isInitializing, router, user?.role]);
  useEffect(() => {
    load();
  }, []);
  if (isInitializing || (isAuthenticated && isAdminRole(user?.role)))
    return (
      <StorefrontShell>
        <main className="min-h-[70vh]" />
      </StorefrontShell>
    );
  if (loading && !data)
    return (
      <StorefrontShell>
        <LandingSkeleton />
      </StorefrontShell>
    );
  if (error || !data)
    return (
      <StorefrontShell>
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
          <p className="font-bold">Không thể tải nội dung trang chủ.</p>
          <p className="mt-2 text-sm text-[#6F6066]">Vui lòng thử lại.</p>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#D96C8A] px-5 text-sm font-bold text-white"
          >
            <RefreshCw className="size-4" />
            Thử lại
          </button>
        </main>
      </StorefrontShell>
    );
  const hero = data.banners[0];
  const heroImage =
    hero?.desktopImage || hero?.imageUrl || data.newArrivals[0]?.imageUrl;
  const featured = data.featuredProducts
    .map((item) => item.product)
    .filter(Boolean);
  const newArrivals = data.newArrivals.slice(0, 8);
  const audience = ["WOMEN", "MEN", "UNISEX"]
    .map((gender) => ({
      gender,
      product: data.newArrivals.find((item) => item.gender === gender),
    }))
    .filter((item) => item.product);
  return (
    <StorefrontShell>
      <main>
        <section className="relative isolate min-h-142.5 overflow-hidden bg-[#E8D9D5] sm:min-h-162.5">
          <ImageWithLoading
            src={heroImage}
            alt={
              hero?.imageAlt ||
              hero?.title ||
              "Bộ sưu tập mới của Quỳnh Nhi Store"
            }
            priority
            className="absolute inset-0 -z-20 size-full"
          />
          <div
            className="absolute inset-0 -z-10 bg-[#20181a]"
            style={{ opacity: (hero?.overlayOpacity ?? 20) / 100 }}
          />
          <div className="mx-auto flex min-h-142.5 max-w-7xl items-end px-5 pb-14 sm:min-h-162.5 sm:px-8 sm:pb-20">
            <div
              className={`max-w-xl ${hero?.textAlignment === "CENTER" ? "mx-auto text-center" : hero?.textAlignment === "RIGHT" ? "ml-auto text-right" : "text-left"} ${hero?.textTheme === "DARK" ? "text-[#2D2226]" : "text-white"}`}
            >
              <p className="text-xs font-bold uppercase tracking-[.28em] text-white/80">
                {hero?.eyebrow || hero?.subtitle || "Bộ sưu tập mới"}
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-[.98] sm:text-7xl">
                {hero?.title || "Chạm vào phong cách của riêng bạn."}
              </h1>
              <p
                className={`mt-6 max-w-md text-sm leading-6 ${hero?.textTheme === "DARK" ? "text-[#6F6066]" : "text-white/85"}`}
              >
                {hero?.description ||
                  (!hero
                    ? "Những thiết kế hiện đại dành cho mọi khoảnh khắc."
                    : null)}
              </p>
              {hero?.primaryCtaLabel || !hero ? (
                <Link
                  href={hero?.primaryCtaUrl || hero?.linkUrl || "/products"}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 bg-[#D96C8A] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#C85B7B]"
                >
                  {hero?.primaryCtaLabel || "Khám phá ngay"}{" "}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
        {audience.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <SectionHeading
              eyebrow="Khám phá"
              title="Phong cách dành cho bạn"
              subtitle="Tìm cảm hứng từ những lựa chọn phù hợp với cá tính riêng."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {audience.map(({ gender, product }) => (
                <Link
                  key={gender}
                  href={`/products?gender=${gender}`}
                  className="group relative aspect-[.9] overflow-hidden bg-[#EDE3E1]"
                >
                  <ImageWithLoading
                    src={product?.imageUrl}
                    alt={
                      gender === "WOMEN"
                        ? "Thời trang nữ"
                        : gender === "MEN"
                          ? "Thời trang nam"
                          : "Thời trang Unisex"
                    }
                    className="size-full transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-5 pb-5 pt-16 text-white">
                    <p className="text-xl font-extrabold">
                      {gender === "WOMEN"
                        ? "Thời trang nữ"
                        : gender === "MEN"
                          ? "Thời trang nam"
                          : "Thời trang Unisex"}
                    </p>
                    <span className="mt-2 inline-flex items-center text-sm font-bold">
                      Khám phá <ArrowRight className="ml-1 size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        {newArrivals.length > 0 && (
          <section className="bg-[#F5EFEC] px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                eyebrow="Mới về"
                title="Hàng mới về"
                subtitle="Những thiết kế mới nhất vừa có mặt tại Quỳnh Nhi Store."
                href="/products"
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}
        {data.sections.map(
          (section) =>
            section.products.length > 0 && (
              <section
                key={section.id}
                className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"
              >
                <SectionHeading
                  eyebrow="Quỳnh Nhi Store"
                  title={section.title}
                  subtitle={section.subtitle}
                  href="/products"
                />
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {section.products.map(({ product }) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ),
        )}
        {featured.length > 0 && (
          <section className="bg-[#2F2529] px-5 py-16 text-white sm:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                eyebrow="Được lựa chọn"
                title="Sản phẩm nổi bật"
                subtitle="Những sản phẩm được cửa hàng chọn để bạn dễ dàng bắt đầu."
                href="/products"
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {featured.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}
        {data.categories.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <SectionHeading
              eyebrow="Danh mục"
              title="Khám phá danh mục"
              href="/products"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.categories.slice(0, 4).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className={`group relative overflow-hidden bg-[#EDE3E1] ${index === 0 ? "sm:col-span-2" : ""}`}
                >
                  <ImageWithLoading
                    src={category.products?.[0]?.imageUrl}
                    alt={category.name}
                    className="aspect-[1.1] size-full transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-4 pb-4 pt-12 text-white">
                    <p className="text-lg font-extrabold">{category.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="border-y border-[#EAE1E4] bg-white">
          <div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:grid-cols-3 sm:px-8">
            <Benefit
              icon={<Truck />}
              title="Giao hàng toàn quốc"
              text="Đặt hàng thuận tiện, theo dõi dễ dàng."
            />
            <Benefit
              icon={<ShieldCheck />}
              title="Thanh toán an toàn"
              text="COD và MoMo theo cấu hình cửa hàng."
            />
            <Benefit
              icon={<Check />}
              title="Hỗ trợ khách hàng"
              text="Luôn sẵn sàng hỗ trợ bạn."
            />
          </div>
        </section>
      </main>
    </StorefrontShell>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-[#D96C8A]">{icon}</span>
      <div>
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-1 text-xs text-[#8A7D81]">{text}</p>
      </div>
    </div>
  );
}
function LandingSkeleton() {
  return (
    <main aria-busy="true">
      <div className="storefront-skeleton min-h-142.5 sm:min-h-162.5" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="storefront-skeleton h-9 w-72" />
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="storefront-skeleton aspect-[.9]" />
          ))}
        </div>
      </section>
      <section className="bg-[#F5EFEC] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="storefront-skeleton h-9 w-56" />
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="storefront-skeleton aspect-4/5" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
