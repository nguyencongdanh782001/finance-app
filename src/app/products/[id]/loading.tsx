import StorefrontShell from "@/components/Storefront/StorefrontShell";

export default function ProductDetailLoading() {
  return (
    <StorefrontShell>
      <main
        className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8"
        aria-busy="true"
      >
        <div className="storefront-skeleton h-4 w-72" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] lg:gap-16">
          <div className="storefront-skeleton aspect-3/4 w-full rounded-2xl lg:aspect-auto lg:h-180" />
          <div className="space-y-5 py-2">
            <div className="storefront-skeleton h-5 w-28" />
            <div className="storefront-skeleton h-12 w-4/5" />
            <div className="storefront-skeleton h-8 w-40" />
            <div className="storefront-skeleton h-16 w-full" />
            <div className="storefront-skeleton h-14 w-full" />
            <div className="storefront-skeleton h-12 w-full" />
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
