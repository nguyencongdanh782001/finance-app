"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type CustomerNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  createdAt: string;
  isRead: boolean;
};

type CustomerPushPayload = {
  eventId: string;
  notificationId: number;
  orderId: number;
  title: string;
  body: string;
  url: string;
  createdAt: string;
};

const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
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
const badge = (value: number) => (value > 99 ? "99+" : value);

const base64ToBytes = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = window.atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};
const bytesToBase64Url = (value: ArrayBuffer | null) => {
  if (!value) throw new Error("Push subscription không hợp lệ.");
  const bytes = new Uint8Array(value);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export default function CustomerNotificationCenter() {
  const { isAuthenticated, user } = useAuth();
  const customer = Boolean(isAuthenticated && user?.role === "CUSTOMER");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const receivedIds = useRef(new Set<number>());

  const load = useCallback(async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const response = await fetch("/api/me/notifications?limit=12", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        data: CustomerNotification[];
        unreadCount: number;
      };
      setItems(data.data);
      setUnreadCount(data.unreadCount);
      data.data.forEach((item) => receivedIds.current.add(item.id));
    } catch {
      // Push vẫn hoạt động độc lập khi API tạm thời không truy cập được.
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    void load();
    if (!customer) return;
    const refreshTimer = window.setInterval(() => void load(), 15_000);
    if (!("serviceWorker" in navigator)) {
      return () => window.clearInterval(refreshTimer);
    }
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "CUSTOMER_PUSH_RECEIVED") return;
      const payload = event.data.payload as CustomerPushPayload;
      if (!payload?.eventId) return;
      if (receivedIds.current.has(payload.notificationId)) return;
      receivedIds.current.add(payload.notificationId);
      const item: CustomerNotification = {
        id: payload.notificationId,
        type: "ORDER",
        title: payload.title,
        message: payload.body,
        data: { orderId: payload.orderId, url: payload.url },
        createdAt: payload.createdAt,
        isRead: false,
      };
      setItems((current) => [
        item,
        ...current.filter((entry) => entry.id !== item.id),
      ].slice(0, 12));
      setUnreadCount((count) => count + 1);
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      window.clearInterval(refreshTimer);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [customer, load]);

  const markRead = async (item: CustomerNotification) => {
    if (!item.isRead) {
      await fetch(`/api/me/notifications/${item.id}/read`, { method: "PATCH" });
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, isRead: true } : entry,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    const url = typeof item.data?.url === "string" ? item.data.url : null;
    if (url) window.location.assign(url);
  };

  const markAllRead = async () => {
    await fetch("/api/me/notifications/read-all", { method: "PATCH" });
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const enablePush = async () => {
    if (!vapidKey || !("PushManager" in window) || !("Notification" in window)) return;
    setEnablingPush(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToBytes(vapidKey),
      });
      const response = await fetch("/api/me/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: bytesToBase64Url(subscription.getKey("p256dh")),
            auth: bytesToBase64Url(subscription.getKey("auth")),
          },
          deviceName: "Thiết bị khách hàng",
        }),
      });
      if (response.ok) setPushEnabled(true);
    } finally {
      setEnablingPush(false);
    }
  };

  if (!customer) return null;
  const canEnablePush =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    Boolean(vapidKey);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-11 items-center justify-center text-[#6F6066] transition hover:text-[#D96C8A]"
      >
        <Bell className="size-5" />
        {unreadCount ? (
          <span className="absolute right-0 top-0 min-w-4 rounded-full bg-[#D96C8A] px-1 text-center text-[10px] font-bold leading-4 text-white">
            {badge(unreadCount)}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 flex h-[min(620px,calc(100dvh-6rem))] w-[min(92vw,390px)] flex-col overflow-hidden rounded-2xl border border-[#EAE1E4] bg-white shadow-[0_20px_55px_rgba(77,47,58,0.16)]">
          <div className="flex shrink-0 items-center justify-between border-b border-[#EAE1E4] px-5 py-4">
            <div>
              <p className="text-base font-extrabold text-[#2D2226]">Thông báo</p>
              <p className="mt-0.5 text-xs text-[#8B7A80]">Cập nhật đơn hàng của bạn</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!unreadCount}
                onClick={() => void markAllRead()}
                className="h-9 gap-1 rounded-lg px-2 text-xs text-[#6F6066] hover:bg-[#FCEEF3] hover:text-[#A43E5F]"
              >
                <CheckCheck className="size-4" /> Đọc hết
              </Button>
              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-[#8B7A80] hover:bg-[#FCEEF3] hover:text-[#A43E5F]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAF8F8] p-3">
            {canEnablePush && !pushEnabled ? (
              <button
                type="button"
                onClick={() => void enablePush()}
                disabled={enablingPush}
                className="mb-3 flex w-full items-center gap-3 rounded-xl border border-[#F4D6DF] bg-[#FFF7F9] p-3 text-left text-xs text-[#A43E5F]"
              >
                <Bell className="size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm">Bật thông báo realtime</strong>
                  <span className="mt-0.5 block text-[#8B7A80]">Nhận ngay khi đơn hàng thay đổi trạng thái.</span>
                </span>
                {enablingPush ? <Loader2 className="size-4 animate-spin" /> : null}
              </button>
            ) : null}
            {loading ? (
              <div className="flex min-h-40 items-center justify-center text-[#8B7A80]"><Loader2 className="size-5 animate-spin" /></div>
            ) : items.length ? (
              <div className="grid gap-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void markRead(item)}
                    className={`flex w-full gap-3 rounded-xl border p-3 text-left transition hover:border-[#F4B5C5] hover:bg-white ${item.isRead ? "border-[#EAE1E4] bg-white" : "border-[#F4D6DF] bg-[#FFF7F9]"}`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FCEEF3] text-[#D96C8A]"><Bell className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className="line-clamp-1 text-sm font-bold text-[#2D2226]">{item.title}</span>
                        {!item.isRead ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#D96C8A]" /> : null}
                      </span>
                      <span className="mt-1 line-clamp-2 text-xs leading-5 text-[#6F6066]">{item.message}</span>
                      <span className="mt-2 block text-[10px] font-medium text-[#A99BA0]">{relativeTime(item.createdAt)}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#EAE1E4] bg-white px-5 text-center">
                <Bell className="size-6 text-[#D96C8A]" />
                <p className="mt-3 text-sm font-bold text-[#2D2226]">Chưa có thông báo mới</p>
                <p className="mt-1 text-xs text-[#8B7A80]">Cập nhật đơn hàng sẽ xuất hiện tại đây.</p>
              </div>
            )}
          </div>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="flex min-h-14 shrink-0 items-center justify-center gap-2 border-t border-[#EAE1E4] bg-white text-sm font-bold text-[#A43E5F] hover:bg-[#FFF7F9]"
          >
            Xem đơn hàng <ExternalLink className="size-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
