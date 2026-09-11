import StorefrontShell from "@/components/Storefront/StorefrontShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading({
  variant = "overview",
}: {
  variant?: "overview" | "profile";
}) {
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-4 w-44 bg-[#EADFE2]" />
        <div className="flex items-start gap-10 xl:gap-14">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="mb-6 flex items-center gap-3 border-b border-[#F1E9EB] pb-6">
              <Skeleton className="size-12 rounded-full bg-[#F1DDE3]" />
              <div className="grid gap-2">
                <Skeleton className="h-4 w-28 bg-[#EADFE2]" />
                <Skeleton className="h-3 w-20 bg-[#F1E9EB]" />
              </div>
            </div>
            <div className="grid gap-2">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-11 w-full rounded-xl bg-[#F7EFF1]" />
              ))}
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            <Skeleton className="h-8 w-64 bg-[#EADFE2]" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full bg-[#F1E9EB]" />
            {variant === "profile" ? (
              <div className="mt-8 grid gap-5">
                <Skeleton className="h-[520px] w-full rounded-2xl bg-[#F1DDE3]" />
                <Skeleton className="h-[380px] w-full rounded-2xl bg-[#F7EFF1]" />
              </div>
            ) : (
              <div className="mt-8 grid gap-4">
                <Skeleton className="h-64 w-full rounded-2xl bg-[#F1DDE3]" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-32 rounded-2xl bg-[#F7EFF1]" />
                  <Skeleton className="h-32 rounded-2xl bg-[#F7EFF1]" />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}
