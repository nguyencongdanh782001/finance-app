import StorefrontShell from "@/components/Storefront/StorefrontShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading({
  variant = "overview",
  showPassword = false,
}: {
  variant?: "overview" | "profile" | "addresses";
  showPassword?: boolean;
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
                <Skeleton
                  key={item}
                  className="h-11 w-full rounded-xl bg-[#F7EFF1]"
                />
              ))}
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            <Skeleton className="h-8 w-64 bg-[#EADFE2]" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full bg-[#F1E9EB]" />
            {variant === "profile" ? (
              <div className="mt-8 grid gap-5">
                <Skeleton className="h-[520px] w-full rounded-2xl bg-[#F1DDE3]" />
                {showPassword ? (
                  <Skeleton className="h-[380px] w-full rounded-2xl bg-[#F7EFF1]" />
                ) : null}
              </div>
            ) : variant === "addresses" ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#EAE1E4] bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl bg-[#FCEEF3]" />
                        <div className="grid gap-2">
                          <Skeleton className="h-4 w-32 bg-[#EADFE2]" />
                          <Skeleton className="h-3 w-20 bg-[#F1E9EB]" />
                        </div>
                      </div>
                      {item === 1 ? (
                        <Skeleton className="h-6 w-20 rounded-full bg-[#FCEEF3]" />
                      ) : null}
                    </div>
                    <div className="mt-6 grid gap-2">
                      <Skeleton className="h-3 w-full bg-[#F1E9EB]" />
                      <Skeleton className="h-3 w-4/5 bg-[#F1E9EB]" />
                      <Skeleton className="h-3 w-3/5 bg-[#F1E9EB]" />
                    </div>
                    <Skeleton className="mt-6 h-px w-full bg-[#F1E9EB]" />
                    <div className="mt-4 flex gap-4">
                      <Skeleton className="h-4 w-20 bg-[#EADFE2]" />
                      <Skeleton className="h-4 w-28 bg-[#F1E9EB]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-4">
                <Skeleton className="h-64 w-full rounded-2xl bg-[#F1DDE3]" />
                <div className="grid gap-4 md:grid-cols-3">
                  <Skeleton className="h-32 rounded-2xl bg-[#F7EFF1]" />
                  <Skeleton className="h-32 rounded-2xl bg-[#F7EFF1]" />
                  <Skeleton className="h-32 rounded-2xl bg-[#F7EFF1]" />
                </div>
                <div className="mt-2 grid gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-6 w-40 bg-[#EADFE2]" />
                    <Skeleton className="h-4 w-20 bg-[#F1E9EB]" />
                  </div>
                  <Skeleton className="h-48 w-full rounded-2xl bg-[#F7EFF1]" />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}
