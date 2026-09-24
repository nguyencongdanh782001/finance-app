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
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 flex-col border-b border-(--admin-border) bg-white px-5 pb-4 pt-16">
          <div className="min-w-0 pr-12">
            <p className="text-base font-bold text-(--admin-text)">
              Thông báo
            </p>
            <p className="mt-0.5 text-xs text-(--admin-text-muted)">
              Đơn hàng và hoạt động mới
            </p>
          </div>
          <div className="mt-3 flex">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 rounded-lg px-2.5 text-xs text-(--admin-text-secondary) hover:bg-(--admin-primary-soft) hover:text-primary"
              disabled={!unreadCount}
              onClick={() => void markAllRead()}
            >
              <CheckCheck className="size-4" />
              <span>Đọc hết</span>
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-(--admin-background) p-3">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center text-(--admin-text-muted)">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : items.length ? (
            <div className="grid gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openNotification(item)}
                  className={`group flex w-full gap-3 rounded-xl border p-3.5 text-left shadow-[0_2px_10px_rgba(30,20,35,0.03)] transition-all hover:-translate-y-0.5 hover:border-(--admin-primary)/35 hover:shadow-[0_8px_20px_rgba(30,20,35,0.08)] ${item.isRead ? "border-(--admin-border) bg-white" : "border-(--admin-primary)/20 bg-(--admin-primary-soft)/45"}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-(--admin-primary)/10">
                    <Bell className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="line-clamp-1 text-sm font-bold leading-5 text-(--admin-text)">
                        {item.title}
                      </span>
                      {!item.isRead ? (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary ring-4 ring-(--admin-primary)/10" />
                      ) : null}
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs leading-5 text-(--admin-text-secondary)">
                      {item.message}
                    </span>
                    <span className="mt-2 block text-10px font-medium text-(--admin-text-muted)">
                      {relativeTime(item.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-(--admin-border) bg-white px-5 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-(--admin-primary-soft) text-primary">
                <Bell className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-(--admin-text)">
                Chưa có thông báo mới
              </p>
              <p className="mt-1 text-xs text-(--admin-text-muted)">
                Các cập nhật về đơn hàng sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>
        <Link
          href="/admin/notifications"
          onClick={() => setMobileOpen(false)}
          className="flex min-h-14 shrink-0 items-center justify-center gap-2 border-t border-(--admin-border) bg-white px-4 text-sm font-bold text-primary transition-colors hover:bg-(--admin-primary-soft)"
        >
          Xem tất cả thông báo <ExternalLink className="size-4" />
        </Link>
      </div>
    ),
    [items, loading, mobileOpen, openNotification, unreadCount],
  );

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-lg text-(--admin-text-secondary) hover:bg-(--admin-primary-soft) hover:text-primary"
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
      <SheetContent
        side="right"
        className="flex h-dvh w-[min(92vw,460px)] flex-col overflow-hidden border-l border-(--admin-border) bg-white p-0 shadow-[-18px_0_50px_rgba(30,20,35,0.16)] [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:rounded-xl [&>button]:border [&>button]:border-(--admin-border) [&>button]:bg-white [&>button]:text-(--admin-text-secondary) [&>button:hover]:bg-(--admin-primary-soft) [&>button:hover]:text-primary"
      >
        <SheetTitle className="sr-only">Thông báo quản trị</SheetTitle>
        <SheetDescription className="sr-only">
          Thông báo đơn hàng mới và hoạt động của cửa hàng
        </SheetDescription>
        {content}
      </SheetContent>
    </Sheet>
  );
}
