"use client";
/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-img-element */

import { useAuth } from "@/components/Auth/AuthProvider";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import CustomerOrderDetail from "@/components/Account/CustomerOrderDetail";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { toast } from "@/hook/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import type { CustomSelectProps } from "@/interface/Field";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Home,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound,
  Search,
  Trash2,
} from "lucide-react";
import {
  CUSTOMER_ORDER_FILTERS,
  ORDER_STATUS_CONFIG,
  type CustomerOrderFilter,
} from "@/lib/orders/order-status";

const pink = "#D96C8A";
const money = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);
const date = (v: string) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(v));
const label: Record<string, string> = Object.fromEntries(
  Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => [
    status,
    config.shortLabel,
  ]),
);
type Profile = {
  id: number;
  authProvider: "WEB" | "GOOGLE";
  phone: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  gender: string | null;
};
type Address = {
  id: number;
  fullName: string;
  phone: string;
  province: string | null;
  city: string;
  district: string | null;
  ward: string | null;
  line1: string;
  line2: string | null;
  isDefaultShipping: boolean;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
};
type Order = {
  id: number;
  orderNumber: string;
  status: string;
  source: "ONLINE" | "OFFLINE";
  createdAt: string;
  placedAt: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  itemCount: number;
  lineCount: number;
  items: {
    title: string;
    imageUrl: string | null;
    variantLabel: string;
    quantity: number;
  }[];
};
type Purchased = {
  productId: number | null;
  variantId: number | null;
  productNameSnapshot: string;
  colorSnapshot: string | null;
  sizeSnapshot: string | null;
  imageUrl: string | null;
  lastPurchasedAt: string;
  totalPurchasedQuantity: number;
  lastOrderId: number;
  currentProduct: {
    slug: string | null;
    isPublic: boolean;
    isAvailable: boolean;
    currentPrice: number;
  } | null;
};

const request = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Có lỗi xảy ra.");
  return body;
};
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(-2)
    .toUpperCase();

function Sidebar({
  profile,
  logout,
}: {
  profile: Profile | null;
  logout: () => Promise<void>;
}) {
  const path = usePathname();
  const router = useRouter();
  const links = [
    { href: "/account", label: "Tổng quan", icon: Home },
    { href: "/account/profile", label: "Thông tin cá nhân", icon: UserRound },
    { href: "/account/addresses", label: "Sổ địa chỉ", icon: MapPin },
    { href: "/account/orders", label: "Đơn hàng của tôi", icon: Package },
  ];
  const name = profile?.displayName || "Khách hàng";
  return (
    <aside className="sticky top-30 hidden w-64 shrink-0 self-start lg:block">
      <div className="mb-6 flex items-center gap-3 border-b border-[#EAE1E4] pb-6">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FCEEF3] font-bold text-[#A43E5F]">
          {profile === null ? (
            <Skeleton className="size-full rounded-full bg-[#F1DDE3]" />
          ) : profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials(name)
          )}
        </div>
        <div className="min-w-0">
          {profile === null ? (
            <div
              className="grid gap-2"
              aria-label="Đang tải thông tin khách hàng"
            >
              <Skeleton className="h-4 w-28 bg-[#EADFE2]" />
              <Skeleton className="h-3 w-20 bg-[#F1E9EB]" />
            </div>
          ) : (
            <>
              <p className="truncate font-extrabold">{name}</p>
              <p className="mt-0.5 text-xs text-[#6F6066]">
                {profile.authProvider === "GOOGLE"
                  ? "Đã xác thực với Google"
                  : profile.phone || "Chưa xác thực"}
              </p>
            </>
          )}
        </div>
      </div>
      <nav className="grid gap-1" aria-label="Tài khoản">
        {links.map(({ href, label: text, icon: Icon }) => {
          const active =
            path === href ||
            (href === "/account/orders" && path.startsWith(href));
          return (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] ${active ? "bg-[#FCEEF3] text-[#D96C8A] before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-[#D96C8A]" : "text-[#6F6066] hover:rounded-xl hover:bg-white hover:text-[#D96C8A]"}`}
            >
              <Icon className="size-4.5" />
              {text}
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => void logout().then(() => router.push("/"))}
        className="mt-8 flex min-h-11 items-center gap-3 px-3 text-sm font-bold text-[#6F6066] hover:text-[#D96C8A]"
      >
        <LogOut className="size-4.5" />
        Đăng xuất
      </button>
    </aside>
  );
}

function MobileNav({
  profile,
  logout,
}: {
  profile: Profile | null;
  logout: () => Promise<void>;
}) {
  const path = usePathname();
  const router = useRouter();
  const links = [
    { href: "/account", label: "Tổng quan", icon: Home },
    { href: "/account/profile", label: "Thông tin cá nhân", icon: UserRound },
    { href: "/account/addresses", label: "Sổ địa chỉ", icon: MapPin },
    { href: "/account/orders", label: "Đơn hàng của tôi", icon: Package },
  ];
  return (
    <div className="mb-6 lg:hidden">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#EAE1E4] bg-white p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FCEEF3] text-sm font-bold text-[#A43E5F]">
            {profile === null ? (
              <Skeleton className="size-full rounded-full bg-[#F1DDE3]" />
            ) : profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              initials(profile?.displayName || "KH")
            )}
          </div>
          <div className="min-w-0">
            {profile === null ? (
              <div
                className="grid gap-2"
                aria-label="Đang tải thông tin khách hàng"
              >
                <Skeleton className="h-3.5 w-28 bg-[#EADFE2]" />
                <Skeleton className="h-3 w-20 bg-[#F1E9EB]" />
              </div>
            ) : (
              <>
                <p className="truncate text-sm font-extrabold">
                  {profile.displayName || "Tài khoản của tôi"}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#6F6066]">
                  {profile.authProvider === "GOOGLE"
                    ? "Đã xác thực với Google"
                    : profile.phone || "Chưa xác thực"}
                </p>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout().then(() => router.push("/"))}
          aria-label="Đăng xuất"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[#6F6066] transition hover:bg-[#FCEEF3] hover:text-[#A43E5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A]"
        >
          <LogOut className="size-5" />
        </button>
      </div>
      <nav
        className="mt-3 grid grid-cols-2 gap-2"
        aria-label="Điều hướng tài khoản"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            path === href ||
            (href === "/account/orders" && path.startsWith(href));
          return (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] ${active ? "border-[#F4B5C5] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#6F6066] hover:border-[#F4B5C5] hover:text-[#A43E5F]"}`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Membership() {
  const [data, setData] = useState<{
    current?: {
      spending: number;
      membership: {
        name: string;
        color: string | null;
        minSpendAmount: number;
      } | null;
    };
    currentRank?: {
      name: string;
      minSpend: number;
      color: string | null;
      benefits: { name: string; description: string | null }[];
    } | null;
    nextRank?: { name: string; minSpend: number; color: string | null } | null;
    eligibleSpend?: number;
    remainingSpend?: number;
    progressPercentage?: number;
    periodStart?: string;
    periodEnd?: string;
    calculatedAt?: string;
    benefits?: { name: string; description: string | null }[];
    cycle?: { start: string; end: string };
  } | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    setError(false);
    return request("/api/memberships/me")
      .then(setData)
      .catch(() => setError(true));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (error)
    return (
      <section className="border border-[#EAE1E4] bg-white p-6">
        <p className="font-bold">Không thể tải thông tin hạng thành viên.</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 text-sm font-bold text-[#A43E5F]"
        >
          Thử lại →
        </button>
      </section>
    );
  if (!data)
    return (
      <section
        className="h-72 animate-pulse bg-[#3C2A30] p-6 sm:p-8"
        aria-label="Đang tải hạng thành viên"
      />
    );
  const current =
    data.currentRank ||
    (data.current?.membership
      ? {
          name: data.current.membership.name,
          minSpend: data.current.membership.minSpendAmount,
          color: data.current.membership.color,
          benefits: data.benefits || [],
        }
      : null);
  const spend = data.eligibleSpend ?? data.current?.spending ?? 0;
  const next = data.nextRank;
  const progress = next
    ? Math.max(0, Math.min(100, data.progressPercentage ?? 0))
    : 100;
  const spendLabel = spend > 0 ? money(spend) : "Chưa phát sinh";
  return (
    <section className="overflow-hidden bg-[#3C2A30] p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-[#F4B5C5]">
            HẠNG THÀNH VIÊN
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            {current?.name || "Chưa đạt hạng"}
          </h2>
        </div>
        <ShieldCheck className="size-8 text-[#F4B5C5]" />
      </div>
      <div className="mt-8">
        <p className="text-sm text-white/75">Chi tiêu trong chu kỳ</p>
        <strong className="mt-1 block text-xl">{spendLabel}</strong>
      </div>
      {next ? (
        <>
          <p className="mt-5 text-base font-semibold leading-7">
            Chi tiêu thêm{" "}
            <strong className="text-[#F4B5C5]">
              {money(data.remainingSpend ?? 0)}
            </strong>{" "}
            để đạt hạng <strong className="text-[#F4B5C5]">{next.name}</strong>
          </p>
          <div className="mt-5">
            <div className="h-2 bg-white/15">
              <div
                className="h-full bg-[#D96C8A] motion-safe:transition-[width] motion-safe:duration-700"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Tiến độ lên hạng ${next.name}`}
              />
            </div>
            <div className="mt-2 flex justify-between gap-4 text-xs text-white/75">
              <span className="min-w-0 wrap-break-word">
                {current?.name
                  ? `${current.name}: ${money(current.minSpend || 0)}`
                  : "Bắt đầu: 0 đ"}
              </span>
              <span className="min-w-0 wrap-break-word text-right">
                {next.name}: {money(next.minSpend)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-5 text-base font-semibold text-[#F4B5C5]">
          Bạn đang ở hạng thành viên cao nhất.
        </p>
      )}
      <p className="mt-5 text-xs text-white/65">
        Chu kỳ:{" "}
        {data.periodStart && data.periodEnd
          ? `${date(data.periodStart)} – ${date(data.periodEnd)}`
          : data.cycle
            ? `${date(data.cycle.start)} – ${date(data.cycle.end)}`
            : "Đang cập nhật"}
      </p>
      {current?.benefits?.length || data.benefits?.length ? (
        <p className="mt-4 text-sm leading-6 text-white/80">
          Quyền lợi:{" "}
          {(current?.benefits || data.benefits || [])
            .map((b) => b.name)
            .join(" · ")}
        </p>
      ) : null}
    </section>
  );
}

function Overview({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      request("/api/me/orders?limit=3"),
      request("/api/me/addresses"),
    ])
      .then(([o, a]) => {
        setOrders(o.items || []);
        setAddress(a.find((x: Address) => x.isDefaultShipping) || a[0] || null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="grid gap-6">
      {profile === null ? (
        <div className="grid gap-2" aria-label="Đang tải lời chào">
          <Skeleton className="h-4 w-44 bg-[#F1E9EB]" />
          <Skeleton className="h-9 w-56 max-w-full bg-[#EADFE2]" />
        </div>
      ) : (
        <div>
          <p className="text-sm text-[#6F6066]">Chào mừng bạn trở lại,</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            Xin chào, {profile.displayName || "bạn"}
          </h1>
        </div>
      )}
      <Membership />
      <div className="grid gap-4 md:grid-cols-3">
        <Summary
          title="Thông tin cá nhân"
          icon={<UserRound />}
          text={`${profile?.displayName || "Chưa cập nhật"}\n${profile?.phone || ""}`}
          action="Chỉnh sửa"
          onClick={() => router.push("/account/profile")}
          loading={loading}
        />
        <Summary
          title="Địa chỉ mặc định"
          icon={<MapPin />}
          text={
            address
              ? `${address.fullName}\n${[address.line1, address.ward, address.district, address.city].filter(Boolean).join(", ")}`
              : "Bạn chưa có địa chỉ giao hàng."
          }
          action={address ? "Quản lý địa chỉ" : "Thêm địa chỉ"}
          onClick={() => router.push("/account/addresses")}
          loading={loading}
        />
        <Summary
          title="Mua hàng"
          icon={<Package />}
          text={`${orders.length ? `${orders.length} đơn hàng gần đây` : "Chưa có đơn hàng"}\nTheo dõi hành trình mua sắm`}
          action="Xem đơn hàng"
          onClick={() => router.push("/account/orders")}
          loading={loading}
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Đơn hàng gần đây</h2>
          <button
            type="button"
            onClick={() => router.push("/account/orders")}
            className="text-sm font-bold text-[#A43E5F]"
          >
            Xem tất cả
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          {loading ? (
            <div className="grid gap-3" aria-label="Đang tải đơn hàng gần đây">
              <Skeleton className="h-32 w-full rounded-2xl bg-[#F7EFF1]" />
              <Skeleton className="h-32 w-full rounded-2xl bg-[#F7EFF1]" />
            </div>
          ) : orders.length ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => router.push(`/account/orders/${order.id}`)}
              />
            ))
          ) : (
            <Empty
              text="Bạn chưa có đơn hàng nào"
              action="Khám phá sản phẩm"
              onClick={() => router.push("/products")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
function Summary({
  title,
  icon,
  text,
  action,
  onClick,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  text: string;
  action: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <section className="border border-[#EAE1E4] bg-white p-5">
      <div className="flex items-center gap-2 text-[#D96C8A]">
        <span className="size-5 [&>svg]:size-5">{icon}</span>
        <h2 className="text-sm font-extrabold text-[#2D2226]">{title}</h2>
      </div>
      {loading ? (
        <div className="mt-4 grid gap-2" aria-label={`Đang tải ${title}`}>
          <div className="h-4 w-4/5 animate-pulse rounded-md bg-[#F1E9EB]" />
          <div className="h-4 w-3/5 animate-pulse rounded-md bg-[#F7EFF1]" />
        </div>
      ) : (
        <p className="mt-4 min-h-10 whitespace-pre-line wrap-break-word text-sm leading-6 text-[#6F6066]">
          {text}
        </p>
      )}
      {loading ? (
        <Skeleton className="mt-4 h-4 w-24 bg-[#F1E9EB]" />
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="mt-4 text-sm font-extrabold text-[#A43E5F]"
        >
          {action} →
        </button>
      )}
    </section>
  );
}
function ProfilePage({
  profile,
  refresh,
}: {
  profile: Profile | null;
  refresh: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    displayName: profile?.displayName || "",
    birthday: profile?.birthday?.slice(0, 10) || "",
    gender: profile?.gender || "UNSPECIFIED",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await request("/api/me", { method: "PATCH", body: JSON.stringify(form) });
      await refresh();
      setMessage("Đã cập nhật thông tin cá nhân.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật.");
    }
  };
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold">Thông tin cá nhân</h1>
      <p className="mt-2 text-sm text-[#6F6066]">
        Quản lý thông tin để việc mua sắm và giao hàng thuận tiện hơn.
      </p>
      <form
        onSubmit={save}
        className="mt-8 border border-[#EAE1E4] bg-white p-5 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Họ và tên">
            <Input
              required
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
            />
          </Field>
          <Field label="Ngày sinh">
            <Input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </Field>
          <Field label="Số điện thoại">
            <Input
              value={profile?.phone || "Chưa cập nhật"}
              readOnly
              className="bg-[#FAF8F8]"
            />
            <small className="text-xs text-[#6F6066]">
              Số điện thoại được dùng để đăng nhập.
            </small>
          </Field>
          <Field label="Giới tính">
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="h-10 w-full border border-[#EAE1E4] bg-white px-3 text-sm outline-none focus:border-[#D96C8A]"
            >
              <option value="UNSPECIFIED">Chưa cập nhật</option>
              <option value="FEMALE">Nữ</option>
              <option value="MALE">Nam</option>
              <option value="OTHER">Khác</option>
            </select>
          </Field>
        </div>
        {profile?.email && (
          <p className="mt-5 text-sm text-[#6F6066]">
            Email:{" "}
            <span className="font-semibold text-[#2D2226]">
              {profile.email}
            </span>
          </p>
        )}
        {error && (
          <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>
        )}
        {message && (
          <p className="mt-5 text-sm font-semibold text-[#4B8063]">{message}</p>
        )}
        <Button type="submit" variant="brand" className="mt-6 h-11 px-6">
          Lưu thay đổi
        </Button>
      </form>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
    </label>
  );
}
function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const load = useCallback((showLoading = false) => {
    setError(false);
    if (showLoading) setLoading(true);
    setRefreshing(true);
    return request("/api/me/addresses")
      .then((data) => setItems(data))
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    void load(true);
  }, [load]);
  const remove = async (item: Address) => {
    await request(`/api/me/addresses/${item.id}`, { method: "DELETE" });
    void load(false);
  };
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#FCEEF3] text-[#A43E5F]">
              <MapPin className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Sổ địa chỉ
              </h1>
              <p className="mt-1 text-sm text-[#6F6066]">
                Quản lý địa chỉ giao hàng của bạn
              </p>
            </div>
          </div>
          {items.length > 0 && !loading ? (
            <p className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9A8C92]">
              {items.length} địa chỉ đã lưu
              {refreshing ? (
                <LoaderCircle
                  className="size-3.5 animate-spin"
                  aria-label="Đang cập nhật"
                />
              ) : null}
            </p>
          ) : null}
        </div>
        <Button
          variant="brand"
          className="h-11 gap-2 rounded-xl px-4 shadow-sm shadow-[#D96C8A]/15"
          onClick={() =>
            setEditing({
              id: 0,
              fullName: "",
              phone: "",
              province: "",
              city: "",
              postalCode: "",
              district: "",
              ward: "",
              line1: "",
              line2: "",
              isDefaultShipping: items.length === 0,
            })
          }
        >
          <Plus className="size-4" />
          Thêm địa chỉ
        </Button>
      </div>
      {loading ? (
        <div
          className="mt-8 grid gap-4 sm:grid-cols-2"
          aria-label="Đang tải địa chỉ"
        >
          {[1, 2, 3].map((item) => (
            <div key={item} className="storefront-skeleton h-56 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#EAE1E4] bg-white px-5 py-12 text-center">
          <MapPin className="mx-auto size-8 text-[#D96C8A]" />
          <p className="mt-4 font-extrabold">Không thể tải sổ địa chỉ</p>
          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-3 text-sm font-bold text-[#A43E5F]"
          >
            Thử lại →
          </button>
        </div>
      ) : items.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="group border border-[#EAE1E4] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#F4B5C5] hover:shadow-[0_10px_30px_rgba(164,62,95,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7F9] text-[#A43E5F]">
                    <Home className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-extrabold">{item.fullName}</h2>
                    <p className="mt-1 text-sm text-[#6F6066]">{item.phone}</p>
                  </div>
                </div>
                {item.isDefaultShipping && (
                  <span className="shrink-0 rounded-full bg-[#FCEEF3] px-2.5 py-1 text-xs font-bold text-[#A43E5F]">
                    Mặc định
                  </span>
                )}
              </div>
              <p className="mt-5 min-h-14 wrap-break-word text-sm leading-6 text-[#6F6066]">
                {[
                  item.line1,
                  item.line2,
                  item.ward,
                  item.district,
                  item.city,
                  item.province,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#EAE1E4] pt-4 text-sm font-bold">
                <button
                  onClick={() => setEditing(item)}
                  className="text-[#A43E5F]"
                >
                  <Pencil className="mr-1 inline size-3.5" /> Chỉnh sửa
                </button>
                {!item.isDefaultShipping && (
                  <button
                    onClick={() =>
                      request(`/api/me/addresses/${item.id}/default`, {
                        method: "PATCH",
                      }).then(() => load(false))
                    }
                    className="text-[#6F6066] transition hover:text-[#A43E5F]"
                  >
                    Đặt làm mặc định
                  </button>
                )}
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    aria-label={`Xóa địa chỉ của ${item.fullName}`}
                    title="Xóa địa chỉ"
                    className="ml-auto inline-flex size-8 items-center justify-center rounded-lg text-[#A43E5F] transition-colors hover:bg-[#FCEEF3] hover:text-[#8F3452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] focus-visible:ring-offset-2"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          text="Bạn chưa có địa chỉ giao hàng"
          action="Thêm địa chỉ"
          className="mt-8"
          onClick={() =>
            setEditing({
              id: 0,
              fullName: "",
              phone: "",
              province: "",
              city: "",
              postalCode: "",
              district: "",
              ward: "",
              line1: "",
              line2: "",
              isDefaultShipping: true,
            })
          }
        />
      )}
      {editing && (
        <AddressForm
          value={editing}
          requireDefault={
            items.length === 0 || (items.length === 1 && editing.id !== 0)
          }
          close={() => setEditing(null)}
          saved={() => {
            setEditing(null);
            void load(false);
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Xóa địa chỉ?"
        description={
          deleting
            ? `Bạn có chắc muốn xóa địa chỉ của ${deleting.fullName} không? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa địa chỉ"
        onConfirm={() => {
          if (!deleting) return;
          return remove(deleting).finally(() => setDeleting(null));
        }}
      />
    </div>
  );
}
type AdministrativeProvince = {
  code: number;
  name: string;
  wards: { code: number; name: string; province_code: number }[];
};
function SearchableAddressSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[#E5E1E4] bg-white px-3 text-left text-sm font-medium text-[#3B2D32] shadow-none outline-none transition focus:border-[#D96C8A] focus:ring-2 focus:ring-[#D96C8A]/15 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        >
          <span className={selected ? "truncate" : "truncate text-[#A99BA0]"}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-[#8A7D81]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) overflow-hidden rounded-xl border-[#E5E1E4] p-0"
      >
        <Command>
          <CommandInput
            icon={<Search className="size-4 text-[#8A7D81]" />}
            placeholder={`Tìm ${placeholder.toLowerCase()}...`}
          />
          <CommandList className="max-h-60 p-1.5">
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-2.5"
              >
                {option.label}
                {option.value === value ? (
                  <Check className="ml-auto size-4 text-[#D96C8A]" />
                ) : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
const addressSchema = Yup.object({
  fullName: Yup.string().trim().required("Vui lòng nhập tên người nhận."),
  phone: Yup.string()
    .matches(/^0\d{9,10}$/, "Số điện thoại không hợp lệ.")
    .required("Vui lòng nhập số điện thoại."),
  city: Yup.string().trim().required("Vui lòng nhập tỉnh/thành phố."),
  line1: Yup.string().trim().required("Vui lòng nhập địa chỉ cụ thể."),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
});
const addressInputClass =
  "h-11! rounded-lg! border-[#E5E1E4]! bg-white! px-3! py-0! text-sm! font-medium! text-[#3B2D32]! shadow-none! focus:border-[#D96C8A]! focus:ring-2! focus:ring-[#D96C8A]/15!";
const addressErrorClass = "text-red-1";
const addressErrorBorderClass = "border-red-1!";

function AddressForm({
  value,
  requireDefault = false,
  close,
  saved,
}: {
  value: Address;
  requireDefault?: boolean;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const formik = useFormik({
    initialValues: value,
    validationSchema: addressSchema,
    enableReinitialize: true,
    onSubmit: async (form) => {
      setError("");
      setIsSaving(true);
      try {
        await request(
          value.id ? `/api/me/addresses/${value.id}` : "/api/me/addresses",
          {
            method: value.id ? "PATCH" : "POST",
            body: JSON.stringify(form),
          },
        );
        saved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể lưu địa chỉ.");
      } finally {
        setIsSaving(false);
      }
    },
  });
  const [provinces, setProvinces] = useState<AdministrativeProvince[]>([]);
  useEffect(() => {
    fetch("/api/locations/administrative")
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("administrative unavailable")),
      )
      .then((data: AdministrativeProvince[]) => setProvinces(data))
      .catch(() =>
        setError(
          "Không thể tải danh sách tỉnh thành. Bạn vẫn có thể nhập thủ công.",
        ),
      );
  }, []);
  const selectedProvince = provinces.find(
    (item) => item.name === formik.values.city,
  );
  const selectClass =
    "h-11! rounded-lg! border-[#E5E1E4]! bg-white! px-3! text-sm! font-medium! text-[#3B2D32]! shadow-none! focus:border-[#D96C8A]! focus:ring-2! focus:ring-[#D96C8A]/15!";
  return (
    <FormikProvider value={formik}>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 sm:items-center">
        <form
          onSubmit={formik.handleSubmit}
          className="max-h-[92dvh] w-full overflow-y-auto bg-white p-5 sm:max-w-xl sm:p-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">
              {value.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Đóng"
              className="text-2xl text-[#6F6066]"
            >
              ×
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 items-start">
            <Field label="Tên người nhận">
              <Input
                variant="border"
                name="fullName"
                placeholder="Nhập họ và tên người nhận"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.fullName && formik.errors.fullName,
                )}
                className={`${addressInputClass} ${formik.touched.fullName && formik.errors.fullName ? addressErrorBorderClass : ""}`}
              />
              {formik.touched.fullName && formik.errors.fullName ? (
                <span className={`text-xs font-medium ${addressErrorClass}`}>
                  {formik.errors.fullName}
                </span>
              ) : null}
            </Field>
            <Field label="Số điện thoại">
              <Input
                variant="border"
                inputMode="tel"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.phone && formik.errors.phone,
                )}
                className={`${addressInputClass} ${formik.touched.phone && formik.errors.phone ? addressErrorBorderClass : ""}`}
              />
              {formik.touched.phone && formik.errors.phone ? (
                <span className={`text-xs font-medium ${addressErrorClass}`}>
                  {formik.errors.phone}
                </span>
              ) : null}
            </Field>
            <Field label="Tỉnh/Thành phố">
              <AutoCompleteField<CustomSelectProps>
                component={CustomSelect}
                version="field"
                name="city"
                searchable
                fullWidth
                placeholder="Tìm tỉnh/thành phố"
                optionValue={provinces.map((province) => ({
                  value: province.name,
                  label: province.name,
                }))}
                inputClassName={`${addressInputClass} ${formik.touched.city && formik.errors.city ? addressErrorBorderClass : ""}`}
                className={`h-11! w-full! min-w-0! rounded-xl! ${formik.touched.city && formik.errors.city ? addressErrorBorderClass : ""}`}
                onManualSelect={(name) => {
                  formik.setValues({
                    ...formik.values,
                    city: name || "",
                    district: "",
                    ward: "",
                    latitude: null,
                    longitude: null,
                  });
                }}
              />
            </Field>
            <Field label="Phường/Xã">
              <AutoCompleteField<CustomSelectProps>
                component={CustomSelect}
                version="field"
                name="ward"
                searchable
                fullWidth
                placeholder="Tìm phường/xã"
                optionValue={
                  selectedProvince?.wards.map((ward) => ({
                    value: ward.name,
                    label: ward.name,
                  })) || []
                }
                inputClassName={addressInputClass}
                className="h-11! w-full! min-w-0! rounded-xl!"
                disabled={!selectedProvince}
                onManualSelect={(name) =>
                  formik.setValues({
                    ...formik.values,
                    ward: name || "",
                    latitude: null,
                    longitude: null,
                  })
                }
              />
            </Field>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Địa chỉ cụ thể
              <Input
                variant="border"
                name="line1"
                placeholder="Số nhà, tên đường"
                value={formik.values.line1}
                onChange={(event) =>
                  formik.setValues({
                    ...formik.values,
                    line1: event.target.value,
                    latitude: null,
                    longitude: null,
                  })
                }
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.line1 && formik.errors.line1,
                )}
                className={`${addressInputClass} ${formik.touched.line1 && formik.errors.line1 ? addressErrorBorderClass : ""}`}
              />
              {formik.touched.line1 && formik.errors.line1 ? (
                <span className={`text-xs font-medium ${addressErrorClass}`}>
                  {formik.errors.line1}
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Ghi chú
              <Input
                variant="border"
                name="line2"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao"
                value={formik.values.line2 || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={addressInputClass}
              />
            </label>
          </div>
          <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={formik.values.isDefaultShipping}
              onChange={formik.handleChange}
              name="isDefaultShipping"
              disabled={requireDefault}
              className="size-4 accent-[#D96C8A]"
            />
            {requireDefault
              ? "Địa chỉ duy nhất luôn là mặc định"
              : "Đặt làm địa chỉ mặc định"}
          </label>
          {error && (
            <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
          )}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
              disabled={isSaving}
              className="h-11"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={isSaving}
              className="h-11 gap-2"
            >
              {isSaving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              {isSaving ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
}
function OrderCard({
  order,
  onClick,
  onCancel,
  cancelling,
}: {
  order: Order;
  onClick?: () => void;
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[#EAE1E4] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-extrabold">Đơn #{order.orderNumber}</p>
          <p className="mt-1 text-xs text-[#6F6066]">{date(order.createdAt)}</p>
        </div>
        <span className="bg-[#FCEEF3] px-2.5 py-1 text-xs font-bold text-[#A43E5F]">
          {label[order.status] || order.status}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {order.items.map((item, i) => (
          <div key={`${item.title}-${i}`} className="flex gap-3">
            <div className="size-14 shrink-0 overflow-hidden bg-[#FAF8F8]">
              <img
                src={item.imageUrl || "/logo-quynh-nhi-store-mark.svg"}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-bold">{item.title}</p>
              <p className="mt-1 text-xs text-[#6F6066]">
                {item.variantLabel || "Sản phẩm"} · ×{item.quantity}
              </p>
            </div>
          </div>
        ))}
        {order.lineCount > order.items.length && (
          <p className="text-xs font-semibold text-[#6F6066]">
            +{order.lineCount - order.items.length} sản phẩm khác
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE1E4] pt-4">
        <span className="text-sm text-[#6F6066]">
          Tổng thanh toán{" "}
          <strong className="ml-1 text-base text-[#A43E5F]">
            {money(order.totalAmount)}
          </strong>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#8B7A80]">
            {order.paymentStatus === "PAID"
              ? "Đã thanh toán"
              : order.paymentStatus === "REFUNDED"
                ? "Đã hoàn tiền"
                : "Chưa thanh toán"}
          </span>
          {onCancel && order.status === "PENDING" ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="text-sm font-extrabold text-red-600 disabled:opacity-50"
            >
              {cancelling ? "Đang hủy..." : "Hủy đơn"}
            </button>
          ) : null}
          {onClick && (
            <button
              type="button"
              onClick={onClick}
              className="text-sm font-extrabold text-[#A43E5F]"
            >
              Xem chi tiết →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
function Purchases({ purchased }: { purchased: Purchased[] }) {
  const { add } = require("@/components/Storefront/CartProvider").useCart();
  const router = useRouter();
  const buy = async (p: Purchased) => {
    if (!p.currentProduct?.isAvailable || !p.productId || !p.variantId) return;
    const ok = await add(
      {
        id: p.productId,
        title: p.productNameSnapshot,
        imageUrl: p.imageUrl || "",
        sellPrice: p.currentProduct.currentPrice,
      } as never,
      p.variantId,
    );
    if (!ok) alert("Sản phẩm hiện không còn đủ tồn kho.");
  };
  return (
    <div className="grid gap-3">
      {purchased.length ? (
        purchased.map((p) => (
          <article
            key={`${p.productId}-${p.variantId}-${p.productNameSnapshot}`}
            className="flex flex-col gap-4 border border-[#EAE1E4] bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="size-24 shrink-0 overflow-hidden bg-[#FAF8F8]">
              <img
                src={p.imageUrl || "/logo-quynh-nhi-store-mark.svg"}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold">{p.productNameSnapshot}</h2>
              <p className="mt-1 text-sm text-[#6F6066]">
                {[p.colorSnapshot, p.sizeSnapshot]
                  .filter(Boolean)
                  .join(" · ") || "Sản phẩm"}
              </p>
              <p className="mt-2 text-sm text-[#6F6066]">
                Đã mua {p.totalPurchasedQuantity} sản phẩm · Lần mua gần nhất:{" "}
                {date(p.lastPurchasedAt)}
              </p>
              {!p.currentProduct?.isAvailable && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  Sản phẩm hiện không còn khả dụng.
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="brand"
                className="h-10"
                disabled={!p.currentProduct?.isAvailable}
                onClick={() => void buy(p)}
              >
                Mua lại
              </Button>
              <Button
                variant="ghost"
                className="h-10 border border-[#EAE1E4]"
                onClick={() =>
                  router.push(`/account/orders?order=${p.lastOrderId}`)
                }
              >
                Xem đơn
              </Button>
            </div>
          </article>
        ))
      ) : (
        <Empty
          text="Bạn chưa có sản phẩm đã mua"
          action="Khám phá sản phẩm"
          onClick={() => router.push("/products")}
        />
      )}
    </div>
  );
}
function CancelOrderDialog({
  order,
  reason,
  isSubmitting,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: {
  order: Order | null;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2226]/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-extrabold">Hủy đơn hàng?</h2>
        <p className="mt-2 text-sm text-[#6F6066]">
          Đơn #{order.orderNumber} chỉ có thể hủy trước khi admin xác nhận.
        </p>
        <label className="mt-4 grid gap-2 text-sm font-bold">
          Lý do hủy <span className="text-red-600">*</span>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Nhập lý do hủy đơn"
            maxLength={500}
            className="min-h-24 w-full rounded-xl border border-[#EAE1E4] p-3 font-normal outline-none focus:border-[#D96C8A]"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Đóng
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-11"
            onClick={onConfirm}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Đang hủy..." : "Xác nhận hủy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
function OrdersPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchased, setPurchased] = useState<Purchased[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const view = params.get("view") === "purchased" ? "purchased" : "orders";
  const requestedStatus = params.get("status") as CustomerOrderFilter | null;
  const activeStatus: CustomerOrderFilter =
    CUSTOMER_ORDER_FILTERS.find((filter) => filter.value === requestedStatus)
      ?.value || "ALL";
  useEffect(() => {
    setOrdersLoading(true);
    if (view === "orders")
      request(`/api/me/orders?status=${activeStatus}`)
        .then((d) => setOrders(d.items || []))
        .catch(() => undefined)
        .finally(() => setOrdersLoading(false));
    else
      request("/api/me/purchased-products")
        .then((d) => setPurchased(d.items || []))
        .catch(() => undefined)
        .finally(() => setOrdersLoading(false));
  }, [activeStatus, view]);
  const cancelOrder = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    const orderId = cancelTarget.id;
    setCancellingId(orderId);
    try {
      await request(`/api/me/orders/${orderId}`, {
        method: "POST",
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order,
        ),
      );
      setCancelTarget(null);
      setCancelReason("");
      toast({
        title: "Đã hủy đơn hàng",
        description: "Tồn kho đã được hoàn lại.",
        className: "bg-green-16 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Không thể hủy đơn hàng.",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    } finally {
      setCancellingId(null);
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-extrabold">
        {view === "orders" ? "Đơn hàng của tôi" : "Sản phẩm đã mua"}
      </h1>
      <div className="mt-6 flex gap-1 border-b border-[#EAE1E4]">
        <button
          onClick={() => router.push("/account/orders?view=orders")}
          className={`min-h-11 border-b-2 px-3 text-sm font-extrabold ${view === "orders" ? "border-[#D96C8A] text-[#A43E5F]" : "border-transparent text-[#6F6066]"}`}
        >
          Đơn hàng
        </button>
        <button
          onClick={() => router.push("/account/orders?view=purchased")}
          className={`min-h-11 border-b-2 px-3 text-sm font-extrabold ${view === "purchased" ? "border-[#D96C8A] text-[#A43E5F]" : "border-transparent text-[#6F6066]"}`}
        >
          Sản phẩm đã mua
        </button>
      </div>
      {view === "orders" ? (
        <div
          className="mt-5 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Lọc đơn hàng"
        >
          {CUSTOMER_ORDER_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={activeStatus === filter.value}
              onClick={() =>
                router.push(
                  `/account/orders?view=orders&status=${filter.value}`,
                )
              }
              className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-extrabold transition ${activeStatus === filter.value ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]" : "border-[#EAE1E4] bg-white text-[#6F6066] hover:border-[#F4B5C5] hover:text-[#A43E5F]"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-6">
        {ordersLoading ? (
          <div className="grid gap-4" aria-label="Đang tải đơn hàng">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : view === "orders" ? (
          orders.length ? (
            <div className="grid gap-4">
              {orders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onClick={() =>
                    router.push(
                      `/account/orders/${o.id}?status=${activeStatus}`,
                    )
                  }
                  onCancel={() => {
                    setCancelTarget(o);
                    setCancelReason("");
                  }}
                  cancelling={cancellingId === o.id}
                />
              ))}
            </div>
          ) : (
            <Empty
              text="Bạn chưa có đơn hàng nào"
              action="Khám phá sản phẩm và bắt đầu đơn hàng đầu tiên của bạn"
              onClick={() => router.push("/products")}
            />
          )
        ) : (
          <Purchases purchased={purchased} />
        )}
      </div>
      <CancelOrderDialog
        order={cancelTarget}
        reason={cancelReason}
        isSubmitting={cancellingId === cancelTarget?.id}
        onReasonChange={setCancelReason}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
        onConfirm={() => void cancelOrder()}
      />
    </div>
  );
}
function Empty({
  text,
  action,
  onClick,
  className = "",
}: {
  text: string;
  action: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#EAE1E4] bg-white px-5 py-12 text-center ${className}`}
    >
      <BookOpen className="mx-auto size-8 text-[#D96C8A]" />
      <p className="mt-4 font-extrabold">{text}</p>
      <button
        onClick={onClick}
        className="mt-3 text-sm font-bold text-[#A43E5F]"
      >
        {action} →
      </button>
    </div>
  );
}

export default function AccountCenter({
  section = "overview",
  orderId,
}: {
  section?:
    | "overview"
    | "profile"
    | "addresses"
    | "orders"
    | "order-detail";
  orderId?: number;
}) {
  const { user, logout, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const refresh = useCallback(async () => {
    const data = await request("/api/me");
    setProfile(data);
  }, []);
  useEffect(() => {
    if (!isInitializing && !isAuthenticated)
      router.replace(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
    else if (isAuthenticated) void refresh();
  }, [isAuthenticated, isInitializing, refresh, router]);
  const content =
    section === "profile" ? (
      <ProfilePage profile={profile} refresh={refresh} />
    ) : section === "addresses" ? (
      <AddressesPage />
    ) : section === "orders" ? (
      <OrdersPage />
    ) : section === "order-detail" && orderId ? (
      <CustomerOrderDetail orderId={orderId} />
    ) : (
      <Overview profile={profile} />
    );
  if (isInitializing || !isAuthenticated)
    return (
      <StorefrontShell>
        <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-56 animate-pulse bg-white" />
        </main>
      </StorefrontShell>
    );
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-sm text-[#6F6066]">
          Trang chủ <span className="px-2">/</span> Tài khoản
        </div>
        <MobileNav profile={profile} logout={logout} />
        <div className="flex items-start gap-10 xl:gap-14">
          <Sidebar profile={profile} logout={logout} />
          <div className="min-w-0 flex-1">{content}</div>
        </div>
      </main>
    </StorefrontShell>
  );
}
