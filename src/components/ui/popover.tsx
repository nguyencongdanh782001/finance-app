import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

export const PopoverTriggerVariants = cva(
  "flex w-full items-center justify-between whitespace-nowrap rounded-[4px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        "search-box--blue":
          "bg-blue-3 text-white placeholder:text-white pl-[13px] pr-[9px] py-[7px] gap-[5px] h-[30px]",
        "search-box--lgray":
          "border border-gray-8 rounded-[4px] h-[42px] px-[14px] placeholder-gray-3",
        "search-box--lred":
          "!bg-red-1 !rounded-full border border-gray-8 rounded-[4px] h-[42px] px-[14px] placeholder-white text-white",
        none: "",
      },
    },
    defaultVariants: {
      variant: "none",
    },
  },
);

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> &
    VariantProps<typeof PopoverTriggerVariants>
>(({ className, children, variant, ...props }, ref) => {
  const popoverTriggerClasses = cn(
    PopoverTriggerVariants({ variant }),
    className,
  );
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      className={popoverTriggerClasses}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
});
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
