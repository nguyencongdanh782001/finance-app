import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const LabelVariants = cva("text-left", {
  variants: {
    variant: {
      default: "text-gray-11 text-[11px] font-bold",
      secondary: "text-gray-16 text-xs font-bold",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface LabelProps
  extends
    React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof LabelVariants> {
  asChild?: boolean;
}

const Label: React.FC<LabelProps> = ({
  asChild,
  className,
  children,
  variant,
  ...props
}) => {
  const Comp = asChild ? React.Fragment : "p";
  const LabelClasses = cn(LabelVariants({ variant }), className);

  return (
    <Comp className={LabelClasses} {...props}>
      {children}
    </Comp>
  );
};

export { Label, LabelVariants };
