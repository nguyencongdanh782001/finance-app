import { AdminPageContainer } from "@/components/Admin/AdminPage";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({
  titleWidth = "w-32",
  children,
}: {
  titleWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-surface rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded" />
        <Skeleton className={`h-4 ${titleWidth}`} />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AdminOrderDetailSkeleton() {
  return (
    <AdminPageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5">
          <section className="admin-surface rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          </section>

          <CardSkeleton titleWidth="w-28">
            <div className="divide-y divide-(--admin-border)">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <Skeleton className="size-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-56 max-w-full" />
                    <Skeleton className="h-3 w-36 max-w-full" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <Skeleton className="h-4 w-20 shrink-0" />
                </div>
              ))}
            </div>
          </CardSkeleton>

          <CardSkeleton titleWidth="w-32">
            <div className="space-y-5">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="grid grid-cols-[24px_1fr] gap-3">
                  <div className="flex justify-center">
                    <Skeleton className="mt-1 size-3 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52 max-w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>

        <div className="space-y-5">
          <CardSkeleton titleWidth="w-40">
            <div className="space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </CardSkeleton>

          <CardSkeleton titleWidth="w-24">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardSkeleton>

          <CardSkeleton titleWidth="w-24">
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <Skeleton className="h-px w-full" />
              <div className="flex justify-between gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </CardSkeleton>
        </div>
      </section>
    </AdminPageContainer>
  );
}
