"use client";

import { Button } from "@/components/ui/button";
import { CheckCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  message: string;
  orderId: number | null;
  createdAt: string;
  isRead: boolean;
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const response = await fetch("/api/admin/notifications?limit=50");
    if (response.ok) setItems((await response.json()).data);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);
  const markAll = async () => {
    await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  };
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-(--admin-text)">
            Thông báo
          </h1>
          <p className="mt-1 text-sm text-(--admin-text-secondary)">
            Lịch sử thông báo dành cho quản trị viên.
          </p>
        </div>
        <Button type="button" variant="default" onClick={() => void markAll()}>
          <CheckCheck className="size-4" /> Đánh dấu tất cả đã đọc
        </Button>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-(--admin-border) bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 border-b border-(--admin-border) p-4 last:border-0 ${item.isRead ? "" : "bg-[#FFF7F9]"}`}
            >
              <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="font-semibold text-(--admin-text)">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-(--admin-text-secondary)">
                  {item.message}
                </p>
                <p className="mt-1 text-xs text-(--admin-text-muted)">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-10 text-center text-sm text-(--admin-text-muted)">
            Bạn chưa có thông báo nào.
          </p>
        )}
      </div>
    </main>
  );
}
