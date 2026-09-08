import StorefrontShell from "@/components/Storefront/StorefrontShell";

export default function HomeLoading() {
  return <StorefrontShell><main aria-busy="true"><div className="storefront-skeleton min-h-[570px] sm:min-h-[650px]" /><section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><div className="storefront-skeleton h-9 w-72" /><div className="mt-7 grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="storefront-skeleton aspect-[.9]" />)}</div></section><section className="bg-[#F5EFEC] px-5 py-16 sm:px-8"><div className="mx-auto max-w-7xl"><div className="storefront-skeleton h-9 w-56" /><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="storefront-skeleton aspect-[4/5]" />)}</div></div></section></main></StorefrontShell>;
}
