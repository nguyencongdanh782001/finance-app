import { VariantProps } from "class-variance-authority";
import { FieldProps, getIn } from "formik";
import React, { useState } from "react";
import ScrollTrigger from "./ScrollTrigger";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTriggerVariants,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command";

export interface SelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  optionValue: { value: string; label: string; disabled?: boolean }[];
  placeholder: string;
  clearable?: boolean;
  clearTxt?: string;
  onManualSelect?: (value?: string) => void;
  preventDefault?: boolean;
  popoverTrgVariant?: VariantProps<typeof PopoverTriggerVariants>;
  inputClassName?: string;
  multipliable?: boolean;
  searchClsx?: string;
  searchable?: boolean;
  arrow?: React.ReactNode;
  lblClassName?: string;
  startIcon?: React.ReactNode;
  onOpenChangeManual?: (open: boolean) => void;
  side?: "bottom" | "top" | "right" | "left";
}

const CustomSelect = React.forwardRef<
  HTMLSelectElement,
  FieldProps & SelectProps
>(
  (
    {
      field,
      form,
      optionValue,
      className,
      placeholder,
      clearTxt,
      clearable,
      onManualSelect,
      preventDefault = false,
      disabled,
      multipliable = false,
      searchClsx = "",
      searchable = false,
      inputClassName = "",
      popoverTrgVariant = { variant: "search-box--lgray" },
      arrow,
      lblClassName = "",
      startIcon,
      side,
      onOpenChangeManual,
    },
    _ref,
  ) => {
    const { name, value } = field;
    const { setFieldValue, errors, touched } = form;
    const [open, setOpen] = useState(false);

    const showError = Boolean(getIn(errors, name) && getIn(touched, name));

    const onSingleSelect = (v: string) => {
      if (!preventDefault) {
        setFieldValue(name, v);
      }
      if (onManualSelect) onManualSelect(v);
      setOpen(false);
    };

    const onMultiSelect = (v: string) => {
      if (!preventDefault) {
        const gr = new Set([...value]);

        if (v === null) return;

        if (v === "") {
          setFieldValue(name, []);
          return;
        }

        if (gr.has(v)) {
          gr.delete(v);
        } else {
          gr.add(v);
        }

        setFieldValue(name, [...gr]);
      }

      if (onManualSelect) onManualSelect(v);
    };

    const renderMultiLbl = () => {
      if (multipliable) {
        let val = value as string[];
        val = val.filter((v) => v !== "");
        const lbls = val.map(
          (v) => optionValue.find((opt) => opt.value === v)?.label,
        );

        if (val?.length > 0 && optionValue?.length < 1) {
          return "";
        }

        if (lbls.length > 1 && optionValue?.length > 0) {
          return lbls.join(", ");
        }

        return lbls?.[0] || placeholder;
      }

      return "";
    };

    const onScroll = () => {
      setOpen(false);
    };

    return (
      <div data-admin-select>
        <ScrollTrigger onScroll={onScroll} />

        <Popover
          open={open}
          onOpenChange={(state) => {
            if (!disabled) {
              setOpen(state);
              onOpenChangeManual?.(state);
            }
          }}
        >
          <PopoverTrigger
            variant={popoverTrgVariant?.variant}
            className={`grid min-w-22.5! sm:w-27.75! ${disabled ? "cursor-default opacity-50" : "cursor-pointer"} ${className} ${showError ? "border! border-red-1!" : "border-slate-100!"}`}
            asChild
            disabled={disabled}
          >
            <Button
              data-admin-select-trigger
              type="button"
              variant="input"
              name={name}
              className={`truncate! text-left text-11px disabled:opacity-50 bg-slate-50! rounded-[14px]! text-slate-700! hover:bg-slate-50! shadow-none! ${showError ? "border-red-1!" : "border-slate-100!"} ${inputClassName} ${(multipliable && (value.length === 0 || value[0] === "")) || !value ? "text-slate-300!" : ""} grid`}
              style={{
                gridTemplateColumns: "minmax(0, 1fr) auto",
              }}
              disabled={disabled}
            >
              <div className="flex min-w-0 items-center gap-1.5 truncate">
                {startIcon}
                <p className={`label h-5 min-w-0 truncate ${lblClassName}`}>
                  {multipliable && renderMultiLbl()}
                  {!multipliable &&
                    (value
                      ? optionValue.find((opt) => opt.value === value)?.label
                      : placeholder)}
                </p>
              </div>
              {arrow || (
                <ChevronDown
                  className="h-5! w-5!"
                  color={
                    popoverTrgVariant.variant === "search-box--blue" ||
                    popoverTrgVariant.variant === "search-box--lred"
                      ? "white"
                      : "#94a3b8"
                  }
                  style={{ paddingBottom: "2px" }}
                />
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            data-admin-select-content
            className="left-0 translate-x-0! min-w-(--radix-popover-trigger-width) w-(--radix-popover-trigger-width) rounded-xl! border-slate-100! bg-white p-0 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            side={side || "bottom"}
            align="start"
            style={{ position: "absolute" }}
            // ref https://github.com/shadcn-ui/ui/issues/542#issuecomment-2691610270
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="p-1.5">
              <Command className="max-h-50 xs:max-h-[300px]">
                {searchable && (
                  <div
                    className={`h-10 rounded-2xl border border-slate-100 bg-slate-50 ${searchClsx} `}
                  >
                    <CommandInput
                      className="h-10 text-sm text-slate-600 placeholder:text-slate-300"
                      icon={<Search className="size-4 text-slate-300" />}
                    />
                  </div>
                )}

                <CommandList className="bg-white">
                  {searchable && (
                    <CommandEmpty className="py-3 text-sm text-slate-400">
                      Không có dữ liệu
                    </CommandEmpty>
                  )}

                  <CommandGroup>
                    {clearable && optionValue?.length > 0 && (
                      <p
                        className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-50"
                        onClick={() => {
                          if (!multipliable) onSingleSelect("");
                          if (multipliable) onMultiSelect("");
                        }}
                      >
                        {clearTxt || placeholder}
                      </p>
                    )}

                    {optionValue?.map((opt, idx) => {
                      if (multipliable) {
                        return (
                          <CommandItem
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600"
                            key={opt.value || `${idx}`}
                          >
                            <div
                              onClick={() => onMultiSelect(opt.value)}
                              className={`h-fit w-full grid grid-cols-[1fr_auto] items-center justify-between text-sm ${opt.disabled && "hidden"}`}
                              style={{
                                gridTemplateColumns: "1fr auto",
                              }}
                            >
                              <span className="justify-between break-all whitespace-pre-line">
                                {opt.label}
                              </span>

                              <Check
                                className={cn(
                                  value?.includes(opt.value)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </div>
                          </CommandItem>
                        );
                      }

                      return (
                        <CommandItem
                          data-admin-select-option
                          data-selected={value === opt.value}
                          key={opt.value}
                          value={opt.label}
                          className={`grid grid-cols-[1fr_auto] justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 data-[selected=true]:bg-slate-50 data-[selected=true]:text-slate-700 ${opt.disabled && "hidden"}`}
                          style={{
                            gridTemplateColumns: "1fr auto",
                          }}
                          onSelect={() => {
                            onSingleSelect(opt.value);
                          }}
                        >
                          <span className="justify-between break-all whitespace-pre-line">
                            {opt.label}
                          </span>

                          <Check
                            className={cn(
                              value === opt.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </PopoverContent>
        </Popover>

        {showError && (
          <p className="text-red-1 text-sm mt-1">{getIn(errors, name)}</p>
        )}
      </div>
    );
  },
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
