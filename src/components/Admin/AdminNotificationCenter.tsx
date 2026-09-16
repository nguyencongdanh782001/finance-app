"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/hook/use-toast";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: number | null;
  createdAt: string;
  isRead: boolean;
};

type PushPayload = {
  eventId: string;
  title: string;
  body: string;
  orderId?: number;
  url: string;
  notificationId: string;
};

const relativeTime = (value: string) => {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(value)) / 1000),
  );
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
};

export default function AdminNotificationCenter() {
  const router = useRouter();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const seenEvents = useRef(new Set<string>());

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications?limit=8", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        data: AdminNotification[];
        unreadCount: number;
      };
      setItems(data.data);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  const openNotification = useCallback(
    async (item: AdminNotification) => {
      if (!item.isRead) {
        await fetch(`/api/admin/notifications/${item.id}/read`, {
          method: "PATCH",
        });
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, isRead: true } : entry,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      if (item.orderId) router.push(`/admin/orders/${item.orderId}`);
    },
    [router],
  );

  useEffect(() => {
    void load();
    const handleMessage = (
      event: MessageEvent<{ type?: string; payload?: PushPayload }>,
    ) => {
      if (event.data?.type !== "ADMIN_PUSH_RECEIVED" || !event.data.payload)
        return;
      const payload = event.data.payload;
      if (seenEvents.current.has(payload.eventId)) return;
      seenEvents.current.add(payload.eventId);
      setUnreadCount((count) => count + 1);
      setItems((current) =>
        [
          {
            id: payload.notificationId,
            type: "NEW_ONLINE_ORDER",
            title: payload.title,
            message: payload.body,
            orderId: payload.orderId ?? null,
            createdAt: new Date().toISOString(),
            isRead: false,
          },
          ...current,
        ].slice(0, 8),
      );
      window.dispatchEvent(
        new CustomEvent("admin-order-notification", { detail: payload }),
      );
      toast({
        title: payload.title,
        description: payload.body,
        action: payload.orderId ? (
          <Button
            type="button"
            size="sm"
            className="bg-[#D96C8A] text-white hover:bg-[#C85B7B]"
            onClick={() => router.push(`/admin/orders/${payload.orderId}`)}
          >
            Xem đơn
          </Button>
        ) : undefined,
      });
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
  }, [load, router]);

  const markAllRead = async () => {
    await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const content = useMemo(
    () => (
      <div className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-(--admin-border) px-4 py-3">
          <div>
            <p className="font-bold text-(--admin-text)">Thông báo</p>
            <p className="text-xs text-(--admin-text-muted)">
              Đơn hàng và hoạt động mới
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-(--admin-text-secondary)"
            disabled={!unreadCount}
            onClick={() => void markAllRead()}
          >
            <CheckCheck className="size-3.5" /> Đọc hết
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-(--admin-text-muted)">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : items.length ? (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openNotification(item)}
                className="flex w-full gap-3 border-b border-(--admin-border) px-4 py-3 text-left transition-colors hover:bg-(--admin-primary-soft)"
              >
                <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-(--admin-primary-soft) text-primary">
                  <Bell className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2">
                    <span className="truncate text-sm font-semibold text-(--admin-text)">
                      {item.title}
                    </span>
                    {!item.isRead ? (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-(--admin-text-secondary)">
                    {item.message}
                  </span>
                  <span className="mt-1 block text-10px text-(--admin-text-muted)">
                    {relativeTime(item.createdAt)}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-10 text-center text-sm text-(--admin-text-muted)">
              Bạn chưa có thông báo nào.
            </p>
          )}
        </div>
        <Link
          href="/admin/notifications"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-1 border-t border-(--admin-border) px-4 py-3 text-sm font-semibold text-primary hover:bg-(--admin-primary-soft)"
        >
          Xem tất cả thông báo <ExternalLink className="size-3.5" />
        </Link>
      </div>
    ),
    [items, loading, mobileOpen, openNotification, unreadCount],
  );

  return (
    <>
      <div className="relative hidden sm:block">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-lg text-(--admin-text-secondary) hover:bg-(--admin-primary-soft) hover:text-primary"
          aria-label="Mở thông báo"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <Bell className="size-5" />
          {unreadCount ? (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#D96C8A] px-1 text-center text-10px font-bold leading-4 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
        {mobileOpen ? (
          <div className="absolute right-0 top-11 z-50 w-88 overflow-hidden rounded-xl border border-(--admin-border) bg-white shadow-xl">
            {content}
          </div>
        ) : null}
      </div>
      <div className="sm:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative rounded-lg text-(--admin-text-secondary)"
              aria-label="Mở thông báo"
            >
              <Bell className="size-5" />
              {unreadCount ? (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#D96C8A] px-1 text-center text-10px font-bold leading-4 text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(92vw,380px)] p-0">
            <SheetTitle className="sr-only">Thông báo quản trị</SheetTitle>
            <SheetDescription className="sr-only">
              Thông báo đơn hàng mới và hoạt động của cửa hàng
            </SheetDescription>
            {content}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
