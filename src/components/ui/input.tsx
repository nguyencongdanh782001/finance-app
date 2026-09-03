"use client";
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { FieldProps, getIn } from "formik";
import { Button } from "./button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "focus:outline-none h-full w-full rounded-[4px]! disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "p-[20px] border border-gray-5 rounded-[5px] bg-white text-sm font-medium placeholder-green-1!",
        invisible: "bg-white text-sm font-normal placeholder-gray-8",
        gray: "bg-gray-6 text-sm placeholder-gray-12 rounded-[5px]",
        border:
          "px-[14px] h-[42px] border border-gray-8 text-sm placeholder-gray-12 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  classNameContainer?: string;
  hiddenErr?: boolean;
  onManualChange?: (value: string) => void;
  clearable?: boolean;
  onManualClear?: () => void;
  standalone?: boolean;
  innerRef?: React.Ref<HTMLInputElement>;
}

const Input = React.forwardRef<
  HTMLInputElement,
  Partial<FieldProps> & InputProps
>(
  (
    {
      className,
      type,
      variant = "default",
      field,
      form,
      icon,
      pattern,
      classNameContainer,
      onManualChange,
      hiddenErr,
      clearable,
      onManualClear,
      disabled,
      innerRef,
      standalone: _standalone,
      ...props
    },
    ref,
  ) => {
    const inputClasses = cn(inputVariants({ variant }), className);
    const name = field?.name || props.name || "";
    const value = field?.value ?? props.value ?? "";
    const showError = Boolean(
      form && field && getIn(form.errors, name) && getIn(form.touched, name),
    );
    const regex = pattern ? new RegExp(pattern) : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (!regex || regex.test(v) || v === "") {
        if (form && field) {
          form.setFieldValue(name, v);
        } else {
          props.onChange?.(e);
        }
      }
      onManualChange?.(v);
    };

    return (
      <div
        className={cn(
          icon && "gap-1.25 overflow-hidden rounded-[5px] bg-white",
          classNameContainer,
          "relative flex items-center",
        )}
      >
        {icon}
        <div className="w-full relative">
          <input
            data-slot="input"
            type={type}
            className={`${inputClasses}${showError && !hiddenErr ? "border! border-red-1!" : ""}`}
            ref={ref ?? innerRef}
            disabled={disabled}
            {...field}
            {...props}
            onChange={handleChange}
          />
          {showError && !hiddenErr && (
            <p className="text-red-1 text-xs mt-1">
              {getIn(form?.errors, name)}
            </p>
          )}
          {clearable && !!value && (
            <div className="absolute right-2 top-0 bottom-0 z-10 flex items-center">
              <Button
                variant="ghost"
                size="icon-xs"
                className="p-0! text-gray-4 hover:bg-gray-6 hover:text-gray-2"
                onClick={() => {
                  if (form && field) form.setFieldValue(name, "");
                  else
                    props.onChange?.({
                      target: { value: "" },
                    } as React.ChangeEvent<HTMLInputElement>);
                  onManualClear?.();
                }}
              >
                <X className="text-gray-4 size-2.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
