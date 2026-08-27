import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-white text-slate-400">
        <Inbox className="size-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 text-red-700 hover:bg-red-100"
        onClick={onRetry}
      >
        Thử lại
      </Button>
    </div>
  );
}
