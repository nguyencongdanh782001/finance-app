"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

const inputClassName =
  "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! placeholder:text-(--admin-text-muted)! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";

export default function AdminProfilePage() {
  const { user, restoreSession } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/admin/profile");
      const data = await response.json();
      if (response.ok) {
        setForm({
          displayName: data.displayName || "",
          phone: data.phone || "",
          email: data.email || "",
          password: "",
        });
      } else setMessage(data.message || "Không thể tải thông tin cá nhân.");
      setLoading(false);
    };
    void load();
  }, []);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Không thể cập nhật thông tin.");
        return;
      }
      setForm((current) => ({ ...current, password: "" }));
      setMessage("Đã cập nhật thông tin cá nhân.");
      await restoreSession();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Thông tin cá nhân"
        description="Cập nhật thông tin tài khoản quản trị của bạn."
      />
      <div className="grid max-w-3xl gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <section className="admin-surface flex flex-col items-center rounded-2xl p-5 text-center">
          {loading ? (
            <Skeleton className="size-20 rounded-full" />
          ) : (
            <span className="flex size-20 items-center justify-center rounded-full bg-(--admin-primary-soft) text-(--admin-primary)">
              <UserRound className="size-9" />
            </span>
          )}
          {loading ? (
            <Skeleton className="mt-4 h-4 w-28 rounded-md" />
          ) : (
            <p className="mt-4 font-semibold text-(--admin-text)">
              {user?.displayName || form.displayName || "Tài khoản"}
            </p>
          )}
          <p className="mt-1 text-xs text-(--admin-text-muted)">
            {user?.role === "SUPER_ADMIN"
              ? "Quản trị viên cấp cao"
              : "Quản trị viên"}
          </p>
        </section>
        <section className="admin-surface rounded-2xl p-4 sm:p-5">
          <h2 className="text-base font-semibold text-(--admin-text)">
            Thông tin tài khoản
          </h2>
          {loading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ) : (
            <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                <span>Tên hiển thị</span>
                <Input
                  required
                  value={form.displayName}
                  onChange={(event) =>
                    setForm({ ...form, displayName: event.target.value })
                  }
                  className={inputClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold">
                <span>Số điện thoại</span>
                <Input
                  required
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  className={inputClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                <span>Email</span>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  className={inputClassName}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
                <span>
                  Mật khẩu mới{" "}
                  <span className="font-normal text-(--admin-text-muted)">
                    (để trống nếu không đổi)
                  </span>
                </span>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    placeholder="Tối thiểu 8 ký tự"
                    className={`${inputClassName} pr-10!`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute inset-y-0 right-3 text-(--admin-text-muted) hover:text-(--admin-primary)"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </label>
              {message ? (
                <p className="text-sm text-(--admin-text-secondary) sm:col-span-2">
                  {message}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={saving}
                className="h-10 bg-(--admin-primary) text-white hover:bg-(--admin-primary-hover) sm:col-span-2 sm:w-fit sm:px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </form>
          )}
        </section>
      </div>
    </AdminPageContainer>
  );
}
