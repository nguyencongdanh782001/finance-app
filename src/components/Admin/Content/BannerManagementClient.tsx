"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthDatePicker } from "@/components/Auth/AuthPageClient";
import { Skeleton } from "@/components/ui/skeleton";
import { BANNER_PLACEMENTS, bannerPlacementLabels } from "@/lib/content-policy";
import {
  ArrowLeft,
  Check,
  Copy,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  id: number;
  internalName: string;
  title: string;
  placement: string;
  desktopImage?: string | null;
  mobileImage?: string | null;
  imageAlt: string;
  description?: string | null;
  eyebrow?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  position: number;
  overlayOpacity: number;
  textAlignment: string;
  textTheme: string;
  primaryCtaLabel?: string | null;
  primaryCtaUrl?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
};

const inputClass =
  "h-11 w-full rounded-lg border border-(--admin-border) bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const textareaClass =
  "w-full rounded-lg border border-(--admin-border) bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Không đặt lịch";
const datePickerValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const statusOf = (banner: Banner) => {
  if (!banner.isActive) return "Đã tắt";
  const now = Date.now();
  if (banner.startsAt && new Date(banner.startsAt).getTime() > now)
    return "Đã lên lịch";
  if (banner.endsAt && new Date(banner.endsAt).getTime() < now)
    return "Đã kết thúc";
  return "Đang hoạt động";
};

export function BannerList() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = () => {
    setLoading(true);
    const query = new URLSearchParams({
      ...(search ? { search } : {}),
      ...(placement ? { placement } : {}),
    });
    fetch(`/api/admin/content/banners?${query}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { banners: Banner[] }) => setBanners(data.banners))
      .catch(() => setMessage("Không thể tải danh sách banner."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [placement]);
  const duplicate = async (banner: Banner) => {
    const response = await fetch("/api/admin/content/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...banner,
        internalName: `${banner.internalName} (bản sao)`,
        isActive: false,
      }),
    });
    if (response.ok) load();
    else setMessage("Không thể nhân bản banner.");
  };
  const toggle = async (banner: Banner) => {
    const response = await fetch(`/api/admin/content/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    if (response.ok) load();
  };
  const archive = async (banner: Banner) => {
    if (!window.confirm(`Ẩn banner “${banner.internalName}”?`)) return;
    const response = await fetch(`/api/admin/content/banners/${banner.id}`, {
      method: "DELETE",
    });
    if (response.ok) load();
  };
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-5 sm:py-7 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-(--admin-text-muted)">
            Nội dung website
          </p>
          <h1 className="text-2xl font-semibold text-(--admin-text)">Banner</h1>
          <p className="mt-1 text-sm text-(--admin-text-secondary)">
            Quản lý nội dung nổi bật trên storefront.
          </p>
        </div>
        <Link
          href="/admin/content/banners/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Tạo banner
        </Link>
      </div>
      <section className="admin-surface rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && load()}
            className={inputClass}
            placeholder="Tìm theo tên nội bộ hoặc tiêu đề..."
          />
          <Select
            value={placement || "all"}
            onValueChange={(value) =>
              setPlacement(value === "all" ? "" : value)
            }
          >
            <SelectTrigger aria-label="Lọc theo vị trí">
              <SelectValue placeholder="Tất cả vị trí" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vị trí</SelectItem>
              {BANNER_PLACEMENTS.map((item) => (
                <SelectItem key={item} value={item}>
                  {bannerPlacementLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={load}
            className="h-11 rounded-lg border border-(--admin-border) px-4 text-sm font-semibold hover:bg-(--admin-primary-soft)"
          >
            Lọc
          </button>
        </div>
      </section>
      {message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      ) : null}
      <section className="admin-surface overflow-hidden rounded-2xl">
        {loading ? (
          <BannerListSkeleton />
        ) : banners.length === 0 ? (
          <div className="p-10 text-center">
            <ImagePlus className="mx-auto size-8 text-primary" />
            <p className="mt-3 font-semibold">Chưa có banner nào</p>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              Tạo banner đầu tiên để hiển thị nội dung nổi bật trên website.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-(--admin-border) bg-(--admin-background) text-xs uppercase text-(--admin-text-muted)">
                  <tr>
                    <th className="p-4">Preview</th>
                    <th className="p-4">Tên nội bộ</th>
                    <th className="p-4">Vị trí</th>
                    <th className="p-4">Lịch hiển thị</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-b border-(--admin-border) last:border-0"
                    >
                      <td className="p-4">
                        <div className="h-14 w-24 overflow-hidden rounded-md bg-(--admin-background)">
                          {banner.desktopImage ? (
                            <img
                              src={banner.desktopImage}
                              alt={banner.imageAlt || banner.title}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-(--admin-text-muted)">
                              Text
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{banner.internalName}</p>
                        <p className="mt-1 text-xs text-(--admin-text-secondary)">
                          {banner.title}
                        </p>
                      </td>
                      <td className="p-4 text-(--admin-text-secondary)">
                        {bannerPlacementLabels[
                          banner.placement as keyof typeof bannerPlacementLabels
                        ] || banner.placement}
                      </td>
                      <td className="p-4 text-xs text-(--admin-text-secondary)">
                        {formatDate(banner.startsAt)}
                        <br />→ {formatDate(banner.endsAt)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusOf(banner) === "Đang hoạt động" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {statusOf(banner)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/content/banners/${banner.id}/edit`}
                            className="rounded-md p-2 hover:bg-(--admin-primary-soft)"
                            aria-label="Chỉnh sửa"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => duplicate(banner)}
                            className="rounded-md p-2 hover:bg-(--admin-primary-soft)"
                            aria-label="Nhân bản"
                          >
                            <Copy className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggle(banner)}
                            className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-(--admin-primary-soft)"
                          >
                            {banner.isActive ? "Tắt" : "Bật"}
                          </button>
                          <button
                            type="button"
                            onClick={() => archive(banner)}
                            className="rounded-md p-2 text-red-600 hover:bg-red-50"
                            aria-label="Ẩn"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-xl border border-(--admin-border) p-3"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-(--admin-background)">
                      {banner.desktopImage ? (
                        <img
                          src={banner.desktopImage}
                          alt={banner.imageAlt || banner.title}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {banner.internalName}
                      </p>
                      <p className="mt-1 text-xs text-(--admin-text-secondary)">
                        {bannerPlacementLabels[
                          banner.placement as keyof typeof bannerPlacementLabels
                        ] || banner.placement}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold">
                        {statusOf(banner)}
                      </span>
                    </div>
                    <Link
                      href={`/admin/content/banners/${banner.id}/edit`}
                      className="p-2"
                    >
                      <MoreHorizontal className="size-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function BannerListSkeleton() {
  return (
    <>
      <div className="hidden md:block">
        <div className="grid grid-cols-[120px_1.4fr_1fr_1.2fr_120px_120px] gap-4 border-b border-(--admin-border) bg-(--admin-background) p-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-3 w-3/4" />
          ))}
        </div>
        <div className="divide-y divide-(--admin-border)">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-[120px_1.4fr_1fr_1.2fr_120px_120px] items-center gap-4 p-4"
            >
              <Skeleton className="h-14 w-24 rounded-md" />
              <div className="grid gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-28" />
              <div className="grid gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-xl border border-(--admin-border) p-3"
          >
            <Skeleton className="h-16 w-24 shrink-0 rounded-md" />
            <div className="grid min-w-0 flex-1 content-start gap-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </>
  );
}

function ImageUploadField({
  label,
  value,
  uploading,
  onChange,
  alt,
  ratioClass,
  hint,
}: {
  label: string;
  value?: string | null;
  uploading: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  alt: string;
  ratioClass: string;
  hint: string;
}) {
  return (
    <div className="grid gap-2 text-sm font-semibold">
      <span>{label}</span>
      <label className="group relative block cursor-pointer overflow-hidden rounded-xl border border-dashed border-(--admin-border) bg-(--admin-background) transition-colors hover:border-(--admin-primary-border) hover:bg-(--admin-primary-soft)">
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="sr-only"
        />
        {uploading ? (
          <div
            className={`${ratioClass} flex flex-col items-center justify-center gap-2 text-sm text-(--admin-primary)`}
          >
            <Loader2 className="size-5 animate-spin" />
            Đang tải ảnh...
          </div>
        ) : value ? (
          <div className={`${ratioClass} relative`}>
            <img src={value} alt={alt} className="size-full object-cover" />
            <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/65 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Nhấn để thay ảnh
            </span>
          </div>
        ) : (
          <div
            className={`${ratioClass} flex flex-col items-center justify-center gap-2 px-4 text-center text-(--admin-text-muted)`}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-(--admin-primary-soft) text-(--admin-primary)">
              <ImagePlus className="size-5" />
            </span>
            <span className="text-sm font-semibold text-(--admin-text)">
              Chọn ảnh {label.toLowerCase()}
            </span>
            <span className="text-xs font-normal">PNG, JPG hoặc WebP</span>
          </div>
        )}
      </label>
      <p className="text-xs font-normal text-(--admin-text-muted)">{hint}</p>
    </div>
  );
}

const defaultBanner: Partial<Banner> = {
  internalName: "",
  title: "",
  placement: "HOME_HERO",
  isActive: true,
  imageAlt: "",
  overlayOpacity: 20,
  textAlignment: "LEFT",
  textTheme: "LIGHT",
  position: 0,
};

export function BannerForm({ id }: { id?: string }) {
  const [value, setValue] = useState<Partial<Banner>>(defaultBanner);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/content/banners/${id}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { banner: Banner }) => setValue(data.banner))
      .catch(() => setError("Không thể tải banner."))
      .finally(() => setLoading(false));
  }, [id]);
  const set = (key: keyof Banner, next: unknown) =>
    setValue((current) => ({ ...current, [key]: next }));
  const overlayOpacity = value.overlayOpacity ?? 20;
  const overlayFillPercentage = Math.min(
    100,
    Math.max(0, (overlayOpacity / 80) * 100),
  );
  const upload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "desktopImage" | "mobileImage",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: data,
    });
    const result = await response.json();
    if (response.ok) set(field, result.url);
    else setError(result.message || "Upload ảnh thất bại.");
    setUploading("");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(
      id ? `/api/admin/content/banners/${id}` : "/api/admin/content/banners",
      {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      },
    );
    const result = await response.json();
    if (!response.ok) setError(result.message || "Không thể lưu banner.");
    else window.location.href = "/admin/content/banners";
    setSaving(false);
  };
  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-5 sm:py-7 lg:px-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/content/banners"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">
            {id ? "Chỉnh sửa banner" : "Tạo banner"}
          </h1>
        </div>
        <button
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save className="size-4" />
          {saving ? "Đang lưu..." : "Lưu banner"}
        </button>
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <section className="admin-surface grid gap-4 rounded-2xl p-5">
            <h2 className="font-semibold">Thông tin cơ bản</h2>
            <label className="grid gap-2 text-sm font-semibold">
              Tên nội bộ
              <input
                required
                value={value.internalName || ""}
                onChange={(event) => set("internalName", event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Vị trí
                <Select
                  value={value.placement || "HOME_HERO"}
                  onValueChange={(next) => set("placement", next)}
                >
                  <SelectTrigger aria-label="Vị trí banner">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANNER_PLACEMENTS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {bannerPlacementLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Thứ tự
                <input
                  type="number"
                  min="0"
                  value={value.position ?? 0}
                  onChange={(event) =>
                    set("position", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </label>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-(--admin-text)">
              <input
                type="checkbox"
                checked={value.isActive !== false}
                onChange={(event) => set("isActive", event.target.checked)}
                className="peer sr-only"
              />
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-(--admin-border) bg-white text-transparent transition-colors peer-checked:border-(--admin-primary) peer-checked:bg-(--admin-primary) peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-(--admin-primary)/25">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              Đang bật banner
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Bắt đầu
                <AuthDatePicker
                  allowFuture
                  value={datePickerValue(value.startsAt)}
                  onChange={(next) => set("startsAt", next || null)}
                  placeholder="Chọn ngày bắt đầu"
                  className="h-11! w-full! rounded-lg! border-(--admin-border)! bg-white! text-sm!"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Kết thúc
                <AuthDatePicker
                  allowFuture
                  minDate={datePickerValue(value.startsAt) || undefined}
                  value={datePickerValue(value.endsAt)}
                  onChange={(next) => set("endsAt", next || null)}
                  placeholder="Chọn ngày kết thúc"
                  className="h-11! w-full! rounded-lg! border-(--admin-border)! bg-white! text-sm!"
                />
              </label>
            </div>
          </section>
          <section className="admin-surface grid gap-4 rounded-2xl p-5">
            <h2 className="font-semibold">Nội dung hiển thị</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Eyebrow
                <input
                  value={value.eyebrow || ""}
                  onChange={(event) => set("eyebrow", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Tiêu đề
                <input
                  required
                  maxLength={100}
                  value={value.title || ""}
                  onChange={(event) => set("title", event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Mô tả
              <textarea
                maxLength={250}
                value={value.description || ""}
                onChange={(event) => set("description", event.target.value)}
                className={textareaClass}
                rows={3}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Alt ảnh
              <input
                value={value.imageAlt || ""}
                onChange={(event) => set("imageAlt", event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold">
                Căn chữ
                <Select
                  value={value.textAlignment || "LEFT"}
                  onValueChange={(next) => set("textAlignment", next)}
                >
                  <SelectTrigger aria-label="Căn chữ">
                    <SelectValue placeholder="Chọn căn chữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEFT">Trái</SelectItem>
                    <SelectItem value="CENTER">Giữa</SelectItem>
                    <SelectItem value="RIGHT">Phải</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Màu chữ
                <Select
                  value={value.textTheme || "LIGHT"}
                  onValueChange={(next) => set("textTheme", next)}
                >
                  <SelectTrigger aria-label="Màu chữ">
                    <SelectValue placeholder="Chọn màu chữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHT">Sáng</SelectItem>
                    <SelectItem value="DARK">Tối</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Overlay: {overlayOpacity}%
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={overlayOpacity}
                  onChange={(event) =>
                    set("overlayOpacity", Number(event.target.value))
                  }
                  style={{
                    background: `linear-gradient(to right, var(--admin-primary-hover) 0%, var(--admin-primary-hover) ${overlayFillPercentage}%, var(--admin-primary-soft) ${overlayFillPercentage}%, var(--admin-primary-soft) 100%)`,
                  }}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-(--admin-primary-soft) accent-(--admin-primary) [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-(--admin-primary) [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--admin-primary)"
                />
              </label>
            </div>
          </section>
          <section className="admin-surface grid gap-4 rounded-2xl p-5">
            <h2 className="font-semibold">CTA</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Nhãn CTA chính
                <input
                  maxLength={40}
                  value={value.primaryCtaLabel || ""}
                  onChange={(event) =>
                    set("primaryCtaLabel", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                URL CTA chính
                <input
                  value={value.primaryCtaUrl || ""}
                  onChange={(event) => set("primaryCtaUrl", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Nhãn CTA phụ
                <input
                  maxLength={40}
                  value={value.secondaryCtaLabel || ""}
                  onChange={(event) =>
                    set("secondaryCtaLabel", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                URL CTA phụ
                <input
                  value={value.secondaryCtaUrl || ""}
                  onChange={(event) =>
                    set("secondaryCtaUrl", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
            </div>
          </section>
        </div>
        <aside className="grid content-start gap-6">
          <section className="admin-surface grid gap-4 rounded-2xl p-5">
            <h2 className="font-semibold">Hình ảnh</h2>
            <ImageUploadField
              label="Desktop"
              value={value.desktopImage}
              uploading={uploading === "desktopImage"}
              onChange={(event) => upload(event, "desktopImage")}
              alt={value.imageAlt || "Preview desktop"}
              ratioClass="aspect-video"
              hint="Khuyến nghị 1920 × 800px"
            />
            <ImageUploadField
              label="Mobile"
              value={value.mobileImage}
              uploading={uploading === "mobileImage"}
              onChange={(event) => upload(event, "mobileImage")}
              alt={value.imageAlt || "Preview mobile"}
              ratioClass="aspect-[3/4]"
              hint="Khuyến nghị 750 × 1000px · tuỳ chọn, dùng ảnh desktop nếu trống"
            />
          </section>
        </aside>
      </div>
    </form>
  );
}
