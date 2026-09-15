"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { AdminSelect } from "@/components/Admin/AdminFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  authProvider: "WEB" | "GOOGLE";
  totalOrders: number;
  totalSpent: number;
  rewardPoints: number;
  createdAt: string;
  membership: {
    name: string;
    color: string | null;
    discountRate: number;
  } | null;
};

const inputClassName =
  "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! placeholder:text-(--admin-text-muted)! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";

const statusLabel: Record<User["status"], string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Không hoạt động",
  BLOCKED: "Đã khóa",
};

const roleLabel: Record<User["role"], string> = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  ADMIN: "Quản trị viên",
  CUSTOMER: "Người dùng",
};
const roleOptions = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "CUSTOMER", label: "Người dùng" },
];

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

function StatusBadge({ status }: { status: User["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        status === "ACTIVE"
          ? "bg-(--admin-primary-soft) text-(--admin-primary)"
          : status === "BLOCKED"
            ? "bg-red-50 text-red-600"
            : "bg-slate-100 text-slate-500",
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

function UserSkeleton() {
  return (
    <div className="min-w-0 rounded-xl border border-(--admin-border) bg-white p-3 sm:p-4">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="grid min-w-0 gap-2">
          <Skeleton className="h-4 w-full max-w-40 rounded-md" />
          <Skeleton className="h-3 w-full max-w-56 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 max-w-full rounded-full sm:w-24" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
        <Skeleton className="h-8 rounded-md" />
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    displayName: "",
    phone: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status !== "ALL") params.set("status", status);
      if (role !== "ALL") params.set("role", role);
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (response.ok) setUsers(data);
      else setMessage(data.message || "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [search, status, role]);

  const toggleStatus = async (user: User) => {
    const nextStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, status: nextStatus }),
    });
    const data = await response.json();
    setMessage(
      response.ok ? "Đã cập nhật trạng thái người dùng." : data.message,
    );
    if (response.ok) await load();
  };

  const updateRole = async (user: User, nextRole: string) => {
    if (nextRole === user.role) return;
    setRoleUpdating(user.id);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role: nextRole }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Đã cập nhật role người dùng." : data.message);
    if (response.ok) await load();
    setRoleUpdating(null);
  };

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Không thể tạo người dùng.");
        return;
      }
      setNewUser({
        displayName: "",
        phone: "",
        email: "",
        password: "",
        role: "CUSTOMER",
      });
      setMessage("Đã tạo tài khoản người dùng.");
      setCreateOpen(false);
      await load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Tra cứu khách hàng, membership và trạng thái tài khoản."
        actions={
          <Button
            type="button"
            className="h-10 bg-(--admin-primary) text-white hover:bg-(--admin-primary-hover)"
            onClick={() => setCreateOpen(true)}
          >
            Tạo tài khoản
          </Button>
        }
      />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-(--admin-border) bg-(--admin-background) p-5">
          <DialogTitle className="text-lg text-(--admin-text)">
            Tạo tài khoản người dùng
          </DialogTitle>
          <DialogDescription className="text-sm text-(--admin-text-secondary)">
            Nhập thông tin tài khoản và chọn role cần cấp.
          </DialogDescription>
          <form
            onSubmit={createUser}
            className="mt-2 grid gap-3 sm:grid-cols-2"
          >
            <Input
              required
              value={newUser.displayName}
              onChange={(event) =>
                setNewUser({ ...newUser, displayName: event.target.value })
              }
              placeholder="Tên hiển thị"
              className={inputClassName}
            />
            <Input
              required
              type="tel"
              inputMode="tel"
              value={newUser.phone}
              onChange={(event) =>
                setNewUser({ ...newUser, phone: event.target.value })
              }
              placeholder="Số điện thoại"
              className={inputClassName}
            />
            <Input
              required
              type="email"
              value={newUser.email}
              onChange={(event) =>
                setNewUser({ ...newUser, email: event.target.value })
              }
              placeholder="Email"
              className={inputClassName}
            />
            <Input
              required
              type="password"
              value={newUser.password}
              onChange={(event) =>
                setNewUser({ ...newUser, password: event.target.value })
              }
              placeholder="Mật khẩu tối thiểu 8 ký tự"
              className={inputClassName}
            />
            <AdminSelect
              name="new-user-role"
              value={newUser.role}
              onChange={(value) => setNewUser({ ...newUser, role: value })}
              options={roleOptions}
              placeholder="Cấp role"
            />
            <Button
              type="submit"
              disabled={creating}
              className="h-10 bg-(--admin-primary) text-white hover:bg-(--admin-primary-hover) sm:col-span-2"
            >
              {creating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang tạo...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <section className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-(--admin-text)">
              Danh sách người dùng
            </h2>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              {loading ? (
                <Skeleton className="h-4 w-36 rounded-md" />
              ) : (
                `${users.length} người dùng phù hợp`
              )}
            </p>
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(240px,1fr)_150px_150px] lg:w-[620px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
              className={inputClassName}
              icon={
                <Search className="ml-3 size-4 shrink-0 text-(--admin-text-muted)" />
              }
              classNameContainer="h-10 rounded-lg border border-(--admin-border) bg-white focus-within:border-(--admin-primary) focus-within:ring-2 focus-within:ring-(--admin-primary)/10"
            />
            <AdminSelect
              name="user-status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "ALL", label: "Mọi trạng thái" },
                ...Object.entries(statusLabel).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              placeholder="Trạng thái"
            />
            <AdminSelect
              name="user-role"
              value={role}
              onChange={setRole}
              options={[
                { value: "ALL", label: "Mọi vai trò" },
                ...Object.entries(roleLabel).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              placeholder="Vai trò"
            />
          </div>
        </div>
        {message ? (
          <p className="mt-4 rounded-lg bg-(--admin-background-subtle) px-3 py-2 text-sm text-(--admin-text-secondary)">
            {message}
          </p>
        ) : null}
        <div className="mt-4 grid gap-3">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <UserSkeleton key={index} />
            ))
          ) : users.length ? (
            users.map((user) => (
              <article
                key={user.id}
                className="rounded-xl border border-(--admin-border) bg-white p-4"
              >
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--admin-primary-soft) text-(--admin-primary)">
                      {user.role === "CUSTOMER" ? (
                        <UserRound className="size-5" />
                      ) : (
                        <ShieldCheck className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-(--admin-text)">
                        {user.displayName || "Chưa có tên"}
                      </h3>
                      <p className="truncate text-xs text-(--admin-text-muted)">
                        {user.phone ||
                          user.email ||
                          "Chưa có thông tin liên hệ"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={user.status} />
                    {user.role === "SUPER_ADMIN" ? (
                      <span className="inline-flex h-10 w-40 shrink-0 items-center rounded-lg border border-(--admin-border) bg-slate-50 px-3 text-xs font-semibold text-(--admin-text-muted)">
                        Quản trị viên cấp cao
                      </span>
                    ) : (
                      <div className="w-40 shrink-0">
                        <AdminSelect
                          name={`user-role-${user.id}`}
                          value={user.role}
                          onChange={(value) => void updateRole(user, value)}
                          options={roleOptions}
                          placeholder="Vai trò"
                          disabled={roleUpdating === user.id}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-(--admin-border) py-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-(--admin-text-muted)">
                      Membership
                    </p>
                    <p className="mt-1 font-semibold text-(--admin-text)">
                      {user.membership?.name || "Chưa có hạng"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-(--admin-text-muted)">
                      Chi tiêu
                    </p>
                    <p className="mt-1 font-semibold text-(--admin-text)">
                      {formatMoney(user.totalSpent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-(--admin-text-muted)">
                      Đơn hàng
                    </p>
                    <p className="mt-1 font-semibold text-(--admin-text)">
                      {user.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-(--admin-text-muted)">
                      Điểm thưởng
                    </p>
                    <p className="mt-1 font-semibold text-(--admin-text)">
                      {user.rewardPoints}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-(--admin-text-muted)">
                    {user.email || "Không có email"} ·{" "}
                    {user.authProvider === "GOOGLE" ? "Google" : "Website"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--admin-border) px-3 text-xs font-semibold text-(--admin-text-secondary) hover:border-(--admin-primary) hover:text-(--admin-primary)"
                    >
                      Xem chi tiết <ArrowUpRight className="size-3.5" />
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 border border-(--admin-border) px-3 text-xs"
                      onClick={() => void toggleStatus(user)}
                    >
                      {user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-(--admin-border) px-4 py-10 text-center text-sm text-(--admin-text-muted)">
              Không tìm thấy người dùng phù hợp.
            </p>
          )}
        </div>
      </section>
    </AdminPageContainer>
  );
}
