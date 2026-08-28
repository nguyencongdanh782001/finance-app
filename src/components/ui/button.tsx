import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "",
        adminPrimary:
          "bg-[#D96C8A] text-white font-semibold shadow-[0_2px_5px_rgba(217,108,138,0.22)] hover:bg-[#C85B7B] focus-visible:ring-[#D96C8A]/30",
        adminDanger:
          "bg-red-50 text-red-700 font-semibold hover:bg-red-100 hover:text-red-800 focus-visible:ring-red-300",
        brand: "bg-[#D96C8A] text-white font-extrabold hover:bg-[#C55778]",
        google:
          "border border-[#E9E2E5] bg-white text-[#1C1A1B] font-extrabold shadow-[0_10px_28px_rgba(28,26,27,0.08)] hover:border-[#D96C8A]/45 hover:bg-[#FFFCFA] hover:shadow-[0_14px_34px_rgba(122,41,68,0.12)]",
        authTab:
          "bg-transparent text-[#6F686B] font-bold hover:bg-[#FFF3F6] hover:text-[#7A2944]",
        authTabActive: "bg-[#D96C8A] text-white font-bold hover:bg-[#C55778]",
        linkBrand:
          "h-fit! p-0! text-[#7A2944] font-bold underline-offset-4 hover:underline",
        authField:
          "justify-between border border-[#E9E2E5] bg-[#FFFCFA] px-4 text-base font-semibold text-[#1C1A1B] shadow-none hover:border-[#D96C8A] hover:bg-[#FFFCFA] focus-visible:border-[#D96C8A] focus-visible:ring-[#D96C8A]/12",
        adminAccount:
          "border border-[#E9E2E5] bg-white/95 text-[#1C1A1B] font-bold shadow-[0_10px_30px_rgba(28,26,27,0.10)] hover:border-[#D96C8A] hover:bg-[#FFF3F6]",
        dangerSoft:
          "bg-[#FFF3F6] text-[#A43E5F] font-bold hover:bg-[#F7DEE6] hover:text-[#7A2944]",
        close: "text-gray-2 font-semibold text-base underline p-0! h-fit!",
        input: "border border-gray-8 rounded-[4px] h-[42px] px-[14px]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        auth: "h-12 w-full px-4 text-base",
        google: "h-12 w-full px-4 text-base",
        authTab: "h-10 px-3 text-sm leading-none sm:h-9 sm:min-w-24",
        authField: "h-12 w-full",
        adminAccount: "h-11 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
