"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hook/use-toast";
import { Bell, CheckCircle2, Loader2, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Device = {
  id: string;
  endpoint: string;
  deviceName: string | null;
  platform: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
};

const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

const base64ToBytes = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const normalized = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};

const bytesToBase64Url = (value: ArrayBuffer | null) => {
  if (!value) throw new Error("Push subscription key không hợp lệ.");
  const bytes = new Uint8Array(value);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

const waitForServiceWorker = () =>
  new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          "Service Worker chưa sẵn sàng. Hãy mở bản HTTPS đã deploy hoặc chạy npm run build rồi npm start.",
        ),
      );
    }, 10_000);

    navigator.serviceWorker.ready
      .then((registration) => {
        window.clearTimeout(timeoutId);
        resolve(registration);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });

const ensureServiceWorker = async () => {
  const existing = await navigator.serviceWorker.getRegistration("/");
  const registration =
    existing || (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));

  if (registration.active) return registration;
  return waitForServiceWorker();
};

export default function AdminPushSettings() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [busy, setBusy] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    "default",
  );
  const isNotificationEnabled = devices.some((device) => device.isActive);

  const load = async () => {
    const response = await fetch("/api/admin/push-subscriptions");
    if (response.ok) setDevices((await response.json()).data);
  };

  useEffect(() => {
    const hasNotification = "Notification" in window;
    setUnsupported(
      !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !hasNotification,
    );
    if (hasNotification) setPermission(Notification.permission);
    void load();
  }, []);

  const enable = async () => {
    if (isIos() && !isStandalone()) {
      setShowIosHelp(true);
      return;
    }
    if (unsupported || !vapidKey) {
      toast({
        title: "Chưa thể bật thông báo",
        description: "Thiếu cấu hình Push hoặc trình duyệt không hỗ trợ.",
        variant: "destructive",
      });
      return;
    }
    if (Notification.permission === "denied") {
      setPermission("denied");
      toast({
        title: "Thông báo đang bị chặn",
        description:
          "Hãy bật quyền thông báo cho Quỳnh Nhi Store trong cài đặt trình duyệt.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== "granted") {
        toast({
          title: "Thông báo chưa được bật",
          description: "Bạn có thể cấp lại quyền trong cài đặt trình duyệt.",
        });
        return;
      }
      const registration = await ensureServiceWorker();
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToBytes(vapidKey),
        });
      }
      const response = await fetch("/api/admin/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: bytesToBase64Url(subscription.getKey("p256dh")),
            auth: bytesToBase64Url(subscription.getKey("auth")),
          },
          deviceName: `${isIos() ? "iPhone/iPad" : "Thiết bị Admin"}`,
        }),
      });
      if (!response.ok) throw new Error("Không thể lưu thiết bị.");
      await load();
      toast({
        title: "Đã bật thông báo",
        description: "Thiết bị này đã sẵn sàng nhận đơn hàng mới.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Không thể bật thông báo",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const device = devices.find((item) => item.id === id);
    const response = await fetch(`/api/admin/push-subscriptions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    if (device && "serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription?.endpoint === device.endpoint) {
          await subscription.unsubscribe();
        }
      } catch {
        // The server-side device association has already been removed.
      }
    }
    setDevices((current) => current.filter((device) => device.id !== id));
  };

  return (
    <section className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-(--admin-text-muted)">
          Cài đặt
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-(--admin-text)">
          Thông báo đơn hàng
        </h1>
        <p className="mt-2 text-sm text-(--admin-text-secondary)">
          Nhận thông báo trên điện thoại ngay khi có thông báo mới.
        </p>
      </div>
      {showIosHelp ? (
        <div className="rounded-xl border border-[#F0D8DF] bg-[#FFF7F9] p-4 text-sm text-(--admin-text-secondary)">
          <p className="font-bold text-(--admin-text)">
            Để nhận thông báo trên iPhone/iPad
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Mở website bằng Safari.</li>
            <li>Nhấn Chia sẻ và chọn “Thêm vào Màn hình chính”.</li>
            <li>Mở Quỳnh Nhi Store từ màn hình chính.</li>
            <li>Nhấn “Bật thông báo”.</li>
          </ol>
        </div>
      ) : null}
      <div className="rounded-xl border border-(--admin-border) bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-(--admin-primary-soft) text-primary">
              <Bell className="size-5" />
            </span>
            <div>
              <p className="font-bold text-(--admin-text)">
                {unsupported
                  ? "Không được hỗ trợ"
                  : permission === "denied"
                    ? "Quyền thông báo đang bị chặn"
                  : isNotificationEnabled
                    ? "Đã bật trên thiết bị này"
                    : "Chưa bật"}
              </p>
              <p className="text-xs text-(--admin-text-muted)">
                {unsupported
                  ? "Trình duyệt này chưa hỗ trợ Web Push."
                  : "Chỉ Admin và Super Admin nhận thông báo."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => void enable()}
            disabled={busy || unsupported || isNotificationEnabled}
            aria-pressed={isNotificationEnabled}
            className={
              isNotificationEnabled
                ? "bg-(--admin-success) text-white hover:bg-(--admin-success)"
                : undefined
            }
          >
            {isNotificationEnabled ? (
              <CheckCircle2 className="size-4" />
            ) : busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bell className="size-4" />
            )}{" "}
            {isNotificationEnabled ? "Đã bật thông báo" : "Bật thông báo"}
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-(--admin-border) bg-white p-5 shadow-sm">
        <h2 className="font-bold text-(--admin-text)">Thiết bị đã đăng ký</h2>
        <div className="mt-3 divide-y divide-(--admin-border)">
          {devices.length ? (
            devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Smartphone className="size-5 text-(--admin-text-muted)" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {device.deviceName || "Thiết bị Admin"}
                  </p>
                  <p className="text-xs text-(--admin-text-muted)">
                    {device.platform || "Trình duyệt"} ·{" "}
                    {device.isActive ? "Đang hoạt động" : "Đã tắt"}
                  </p>
                </div>
                {device.isActive ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void remove(device.id)}
                  aria-label="Xóa thiết bị"
                >
                  <Trash2 className="size-4 text-rose-500" />
                </Button>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-(--admin-text-muted)">
              Chưa có thiết bị nào.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
