import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AdminPageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-4 py-5 sm:px-5 sm:py-7 lg:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {breadcrumb ? (
          <div className="mb-1.5 text-xs font-medium text-(--admin-text-muted)">
            {breadcrumb}
          </div>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-(--admin-text) sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-(--admin-text-secondary)">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function AdminSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "admin-surface w-full max-w-full min-w-0 rounded-2xl p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
