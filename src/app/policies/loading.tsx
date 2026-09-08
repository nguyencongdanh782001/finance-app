import StorefrontShell from "@/components/Storefront/StorefrontShell";

function Bar({ className }: { className: string }) { return <div className={`storefront-skeleton rounded-lg ${className}`} />; }

export default function PoliciesLoading() {
  return <StorefrontShell><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16" aria-busy="true"><Bar className="h-4 w-32" /><div className="mt-8 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12"><div className="hidden gap-3 lg:grid"><Bar className="h-4 w-36" /><Bar className="h-12 w-full" /><Bar className="h-12 w-full" /><Bar className="h-12 w-full" /></div><div className="max-w-[860px]"><Bar className="h-5 w-32" /><Bar className="mt-4 h-12 w-3/4" /><Bar className="mt-5 h-6 w-full" /><Bar className="mt-2 h-6 w-5/6" /><Bar className="mt-10 h-5 w-full" /><Bar className="mt-3 h-5 w-full" /><Bar className="mt-3 h-5 w-4/5" /></div></div></main></StorefrontShell>;
}
