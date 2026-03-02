import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto sm:max-w-[765px]", {
  variants: {
    variant: {
      default: "flex flex-col w-full min-h-screen px-[20px]",
      public: "flex flex-col w-full min-h-screen px-[30px]",
      parent: "max-w-none w-screen",
      app: "mx-0 max-w-none sm:max-w-none px-[20px]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ContainerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  asChild,
  className,
  children,
  variant,
  ...props
}) => {
  const Comp = asChild ? React.Fragment : "div";
  const containerClasses = cn(containerVariants({ variant }), className);

  return (
    <Comp className={containerClasses} {...props}>
      {children}
    </Comp>
  );
};

export { Container, containerVariants };
