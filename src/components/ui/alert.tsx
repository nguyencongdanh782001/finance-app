import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] gap-y-1 rounded-xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-(--admin-border) bg-white text-(--admin-text)",
        info: "border-(--admin-primary-border) bg-(--admin-primary-soft) text-(--admin-text)",
        warning: "border-amber-200 bg-amber-50 text-amber-900",
        destructive: "border-rose-200 bg-rose-50 text-rose-800",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("col-start-2 font-semibold", className)} {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-2 text-sm leading-5 opacity-85", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
