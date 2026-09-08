"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { policyTypeLabels, POLICY_TYPES } from "@/lib/content-policy";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, Pencil, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/RichText/RichTextEditor";
import { meaningfulText } from "@/lib/rich-text";

type Policy = {
  id: number;
  type: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: { html?: string; json?: object } | string;
  contentJson?: object | null;
  contentHtml?: string | null;
  summaryJson?: object | null;
  summaryHtml?: string | null;
  summaryText?: string | null;
  status: string;
  showInFooter: boolean;
  footerOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt: string;
};
const inputClass =
  "h-11 w-full rounded-lg border border-(--admin-border) bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const textareaClass =
  "w-full rounded-lg border border-(--admin-border) bg-white px-3 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const contentText = (content: Policy["content"]) =>
  typeof content === "string" ? content : content?.html || "";

export function PolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    fetch("/api/admin/content/policies")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { policies: Policy[] }) => setPolicies(data.policies))
      .catch(() => setError("Không thể tải danh sách chính sách."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  const hide = async (policy: Policy) => {
    if (!window.confirm(`Ẩn chính sách “${policy.title}”?`)) return;
    const response = await fetch(`/api/admin/content/policies/${policy.id}`, {
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
          <h1 className="text-2xl font-semibold text-(--admin-text)">
            Chính sách
          </h1>
          <p className="mt-1 text-sm text-(--admin-text-secondary)">
            Soạn thảo, xuất bản và quản lý liên kết chính sách.
          </p>
        </div>
        <Link
          href="/admin/content/policies/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Tạo chính sách
        </Link>
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <section className="admin-surface overflow-hidden rounded-2xl">
        {loading ? (
          <div className="p-8 text-center text-sm">Đang tải chính sách...</div>
        ) : policies.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold">Chưa có chính sách nào</p>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              Tạo chính sách để cung cấp thông tin rõ ràng cho khách hàng.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex flex-col gap-4 rounded-xl border border-(--admin-border) p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{policy.title}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-11px font-bold">
                      {policy.status === "PUBLISHED"
                        ? "Đã xuất bản"
                        : policy.status === "HIDDEN"
                          ? "Đã ẩn"
                          : "Bản nháp"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-(--admin-text-secondary)">
                    {policyTypeLabels[
                      policy.type as keyof typeof policyTypeLabels
                    ] || policy.type}{" "}
                    · /policies/{policy.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/policies/${policy.slug}`}
                    target="_blank"
                    className="rounded-md p-2 hover:bg-(--admin-primary-soft)"
                    aria-label="Xem trước"
                  >
                    <Eye className="size-4" />
                  </Link>
                  <Link
                    href={`/admin/content/policies/${policy.id}/edit`}
                    className="rounded-md p-2 hover:bg-(--admin-primary-soft)"
                    aria-label="Chỉnh sửa"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => hide(policy)}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                    aria-label="Ẩn"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function PolicyForm({ id }: { id?: string }) {
  const [value, setValue] = useState<Partial<Policy>>({
    type: "PURCHASE_GUIDE",
    title: "",
    slug: "",
    content: { html: "" },
    status: "DRAFT",
    showInFooter: true,
    footerOrder: 0,
  });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/content/policies/${id}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { policy: Policy }) =>
        setValue({
          ...data.policy,
          summaryJson: data.policy.summaryJson || null,
          content: {
            html: data.policy.contentHtml || contentText(data.policy.content),
          },
        }),
      )
      .catch(() => setError("Không thể tải chính sách."))
      .finally(() => setLoading(false));
  }, [id]);
  const set = (key: keyof Policy, next: unknown) =>
    setValue((current) => ({ ...current, [key]: next }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const html = contentText(value.content || "");
    const response = await fetch(
      id ? `/api/admin/content/policies/${id}` : "/api/admin/content/policies",
      {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...value,
          summary: value.summaryText || value.summary || "",
          summaryJson: value.summaryJson,
          summaryHtml: value.summaryHtml,
          summaryText: value.summaryText,
          content: html,
          contentJson: value.contentJson,
          contentHtml: html,
        }),
      },
    );
    const result = await response.json();
    if (!response.ok) setError(result.message || "Không thể lưu chính sách.");
    else window.location.href = "/admin/content/policies";
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
            href="/admin/content/policies"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">
            {id ? "Chỉnh sửa chính sách" : "Tạo chính sách"}
          </h1>
        </div>
        <button
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
        >
          <Save className="size-4" />
          {saving ? "Đang lưu..." : "Lưu chính sách"}
        </button>
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <section className="admin-surface grid gap-5 rounded-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Loại chính sách
            <Select
              value={value.type || "OTHER"}
              onValueChange={(next) => set("type", next)}
            >
              <SelectTrigger aria-label="Loại chính sách">
                <SelectValue placeholder="Chọn loại chính sách" />
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {policyTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Slug
            <input
              required
              value={value.slug || ""}
              onChange={(event) => set("slug", event.target.value)}
              className={inputClass}
              placeholder="chinh-sach-van-chuyen"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Tiêu đề
          <input
            required
            value={value.title || ""}
            onChange={(event) => set("title", event.target.value)}
            className={inputClass}
          />
        </label>
        <RichTextEditor
          preset="compact"
          value={(value.summaryJson as never) || null}
          legacyHtml={value.summaryHtml || value.summary || undefined}
          onChange={(json) => set("summaryJson", json)}
          onHtmlChange={(html) =>
            setValue((current) => ({
              ...current,
              summaryHtml: html,
              summaryText: meaningfulText(html),
              summary: meaningfulText(html),
            }))
          }
          label="Tóm tắt"
          placeholder="Nhập nội dung tóm tắt giúp khách hàng hiểu nhanh về chính sách..."
          maxCharacters={500}
          minHeight={140}
          onBlur={() => undefined}
        />
        <RichTextEditor
          preset="full"
          value={(value.contentJson as never) || null}
          legacyHtml={contentText(value.content || "")}
          onChange={(json) => set("contentJson", json)}
          onHtmlChange={(html) => set("content", { html })}
          uploadContext="STORE_POLICY"
          label="Nội dung"
          placeholder="Nhập nội dung chính sách..."
          maxCharacters={100000}
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold">
            Trạng thái
            <Select
              value={value.status || "DRAFT"}
              onValueChange={(next) => set("status", next)}
            >
              <SelectTrigger aria-label="Trạng thái chính sách">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Lưu bản nháp</SelectItem>
                <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                <SelectItem value="HIDDEN">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Thứ tự footer
            <input
              type="number"
              value={value.footerOrder ?? 0}
              onChange={(event) =>
                set("footerOrder", Number(event.target.value))
              }
              className={inputClass}
            />
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
            <Input
              standalone
              type="checkbox"
              checked={value.showInFooter !== false}
              onChange={(event) => set("showInFooter", event.target.checked)}
              classNameContainer="size-4 shrink-0"
              className="m-0! size-4! h-4! w-4! rounded! border-(--admin-border) p-0! accent-(--admin-primary)"
            />
            Hiện ở footer
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            SEO title
            <input
              maxLength={70}
              value={value.seoTitle || ""}
              onChange={(event) => set("seoTitle", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            SEO description
            <textarea
              maxLength={160}
              value={value.seoDescription || ""}
              onChange={(event) => set("seoDescription", event.target.value)}
              className={textareaClass}
              rows={2}
            />
          </label>
        </div>
      </section>
    </form>
  );
}
