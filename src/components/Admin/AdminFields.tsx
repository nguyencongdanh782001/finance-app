"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LoaderCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

type SelectOption = { value: string; label: string; disabled?: boolean };
export function AdminSelect({
  name,
  value,
  options,
  placeholder,
  onChange,
  searchable = false,
  hasError = false,
  disabled = false,
}: {
  name: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  hasError?: boolean;
  disabled?: boolean;
}) {
  void searchable;

  return (
    <Select
      name={name}
      value={value || "__empty__"}
      onValueChange={(nextValue) =>
        onChange(nextValue === "__empty__" ? "" : nextValue)
      }
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={placeholder}
        className={`h-10! w-full! max-w-full! min-w-0! rounded-lg! border-(--admin-border)! bg-white! text-sm! font-medium! text-(--admin-text-secondary)! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/15! ${hasError ? "border-[#C64040]! focus:border-[#C64040]!" : ""}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value || "__empty__"}
            value={option.value || "__empty__"}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  loading = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
}) {
  return (
    <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-(--admin-border) bg-(--admin-surface) px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
      {loading ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin text-(--admin-primary)" />
      ) : (
        <Search className="size-4 shrink-0 text-slate-400" />
      )}
      <input
        data-slot="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 border-0! rounded-none! bg-transparent text-sm text-(--admin-text) outline-none placeholder:text-(--admin-text-muted) focus-visible:outline-none! focus-visible:border-none! focus-visible:shadow-none!"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-slate-400 hover:bg-slate-100"
          onClick={() => onChange("")}
          aria-label="Xóa nội dung tìm kiếm"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

export function AdminToolbar({
  search,
  filters,
  activeFilterCount,
  onReset,
  desktopClassName,
}: {
  search: ReactNode;
  filters: ReactNode;
  activeFilterCount: number;
  onReset: () => void;
  desktopClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = activeFilterCount > 0;

  const resetButton = (mobile = false) => (
    <Button
      type="button"
      variant="ghost"
      className="h-10 w-full rounded-lg text-slate-500"
      disabled={!hasFilters}
      onClick={() => {
        onReset();
        if (mobile) setOpen(false);
      }}
    >
      <RotateCcw className="size-4" />
      Xóa lọc
    </Button>
  );

  return (
    <>
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 gap-2",
          desktopClassName,
        )}
      >
        <div className="min-w-0">{search}</div>
        <div className="hidden sm:contents">{filters}</div>
        <div className="hidden sm:block">{resetButton()}</div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full rounded-lg border border-slate-200 text-slate-600 sm:hidden"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[min(92vw,380px)] p-5 pt-14">
          <SheetTitle className="text-lg font-semibold text-slate-900">
            Bộ lọc
          </SheetTitle>
          <SheetDescription className="mt-1 text-sm text-slate-500">
            Chọn điều kiện để thu gọn danh sách.
          </SheetDescription>
          <div className="mt-5 grid gap-3">{filters}</div>
          <div className="mt-3">{resetButton(true)}</div>
          <Button
            type="button"
            variant="adminPrimary"
            className="mt-2 h-10 w-full rounded-lg"
            onClick={() => setOpen(false)}
          >
            Áp dụng
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
