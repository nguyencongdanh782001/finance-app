import * as React from "react";

import { cva, VariantProps } from "class-variance-authority";
import { FieldProps, getIn } from "formik";
import { cn } from "@/lib/utils";

const TextAreaVariants = cva(
  "focus:outline-none h-full w-full disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "p-[20px] border border-green-4 rounded-[5px] bg-white text-sm font-medium placeholder-green-1!",
        invisible: "bg-white text-sm font-normal placeholder-gray-8",
        gray: "bg-gray-6 text-sm placeholder-gray-12 rounded-[5px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextAreaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof TextAreaVariants> {
  icon?: React.ReactNode;
  classNameContainer?: string;
  hiddenErr?: boolean;
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  Partial<FieldProps> & TextAreaProps & { innerRef?: React.Ref<HTMLTextAreaElement> }
>(
  (
    {
      className,
      variant = "default",
      field,
      form,
      icon,
      rows,
      classNameContainer,
      disabled,
      hiddenErr,
      innerRef,
      ...props
    },
    ref,
  ) => {
    const inputClasses = cn(TextAreaVariants({ variant }), className);
    const name = field?.name || props.name || "";
    const value = field?.value ?? props.value ?? "";
    const showError = Boolean(
      form && field && getIn(form.errors, name) && getIn(form.touched, name),
    );

    return (
      <div className={`${classNameContainer} flex items-center h-auto`}>
        {icon}
        <div className="w-full h-auto">
          <textarea
            className={`disabled:opacity-50 ${inputClasses}${!hiddenErr && showError ? "border! border-red-1!" : ""}`}
            disabled={disabled}
            ref={ref ?? innerRef}
            rows={rows}
            style={{ ...props.style, resize: "none" }}
            {...field}
            {...props}
            value={value}
          />
          {!hiddenErr && showError && (
            <p className="text-red-1 text-sm mt-1">{getIn(form?.errors, name)}</p>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
