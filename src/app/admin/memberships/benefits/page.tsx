"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { AdminSelect } from "@/components/Admin/AdminFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Tier = { id: number; name: string; color?: string | null };
type Benefit = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  type: string;
  isActive: boolean;
  position: number;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  tiers: Array<{ membershipId: number; membership: Tier }>;
};

const TYPES = [
  ["PERCENTAGE_ORDER_DISCOUNT", "Giảm % đơn hàng"],
  ["FIXED_ORDER_DISCOUNT", "Giảm tiền đơn hàng"],
  ["FREE_SHIPPING", "Miễn phí vận chuyển"],
  ["BIRTHDAY_VOUCHER", "Voucher sinh nhật"],
  ["EARLY_ACCESS", "Mở bán sớm"],
  ["EXCLUSIVE_PRODUCTS", "Sản phẩm độc quyền"],
  ["BONUS_POINTS", "Cộng điểm thưởng"],
  ["CAMPAIGN_ACCESS", "Truy cập chiến dịch"],
  ["FREE_GIFT", "Tặng quà"],
  ["CUSTOM_TEXT", "Nội dung tùy chỉnh"],
] as const;

const initialForm = {
  name: "",
  code: "",
  description: "",
  type: "CUSTOM_TEXT",
  membershipIds: [] as number[],
};
const adminInputClassName =
  "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! placeholder:text-(--admin-text-muted)! outline-none! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";
const adminTextareaClassName =
  "min-h-20 w-full rounded-lg border border-(--admin-border) bg-white p-3 text-sm text-(--admin-text) outline-none transition placeholder:text-(--admin-text-muted) focus:border-(--admin-primary) focus:ring-2 focus:ring-(--admin-primary)/10";
const benefitValidationSchema = Yup.object({
  name: Yup.string().trim().required("Vui lòng nhập tên quyền lợi."),
  code: Yup.string().trim().required("Vui lòng nhập mã quyền lợi."),
  type: Yup.string().required("Vui lòng chọn loại quyền lợi."),
  membershipIds: Yup.array().min(
    1,
    "Vui lòng chọn ít nhất một hạng membership.",
  ),
});

export default function MembershipBenefitsPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const validation = useFormik({
    initialValues: initialForm,
    validationSchema: benefitValidationSchema,
    onSubmit: async () => undefined,
  });
  const hasError = (field: keyof typeof initialForm) =>
    Boolean(validation.touched[field] && validation.errors[field]);
  const fieldClassName = (field: keyof typeof initialForm) =>
    cn(
      adminInputClassName,
      hasError(field) &&
        "border-[#C64040]! focus:border-[#C64040]! focus:ring-[#C64040]/10!",
    );
  const updateField = <K extends keyof typeof initialForm>(
    field: K,
    value: (typeof initialForm)[K],
  ) => {
    void validation.setFieldValue(field, value);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const [benefitResponse, tierResponse] = await Promise.all([
        fetch("/api/membership-benefits"),
        fetch("/api/memberships"),
      ]);
      if (benefitResponse.ok) setBenefits(await benefitResponse.json());
      if (tierResponse.ok) setTiers(await tierResponse.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createBenefit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = await validation.validateForm(form);
    validation.setTouched(
      Object.keys(errors).reduce(
        (result, key) => ({ ...result, [key]: true }),
        {},
      ),
    );
    if (Object.keys(errors).length) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/membership-benefits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.message || "Không thể tạo quyền lợi.");
      return;
    }
    setForm(initialForm);
    setMessage("Đã tạo quyền lợi membership.");
    await load();
  };

  const toggle = async (benefit: Benefit) => {
    await fetch(`/api/membership-benefits/${benefit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !benefit.isActive }),
    });
    await load();
  };

  const filtered = benefits.filter((benefit) => {
    const matchesQuery = `${benefit.name} ${benefit.code}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus =
      status === "all" ||
      (status === "active" ? benefit.isActive : !benefit.isActive);
    return matchesQuery && matchesStatus;
  });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Quyền lợi membership"
        description="Quản lý quyền lợi độc lập với cấu hình hạng thành viên."
      />
      <div className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form
          onSubmit={createBenefit}
          className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5"
        >
          <h2 className="text-base font-semibold text-(--admin-text)">
            Tạo quyền lợi
          </h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">
              Tên quyền lợi
              <Input
                className={fieldClassName("name")}
                value={form.name}
                onBlur={() => validation.setFieldTouched("name", true)}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ví dụ: Giảm 10% đơn hàng"
              />
              {validation.touched.name && validation.errors.name ? (
                <span className="text-xs font-medium text-red-600">
                  {validation.errors.name}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Mã quyền lợi
              <Input
                className={fieldClassName("code")}
                value={form.code}
                onBlur={() => validation.setFieldTouched("code", true)}
                onChange={(event) =>
                  updateField("code", event.target.value.toUpperCase())
                }
                placeholder="MEMBER-10"
              />
              {validation.touched.code && validation.errors.code ? (
                <span className="text-xs font-medium text-red-600">
                  {validation.errors.code}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Loại quyền lợi
              <AdminSelect
                name="benefit-type"
                value={form.type}
                onChange={(value) => updateField("type", value)}

                options={TYPES.map(([value, label]) => ({ value, label }))}
                placeholder="Chọn loại quyền lợi"
                hasError={hasError("type")}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Mô tả khách hàng thấy
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className={adminTextareaClassName}
                placeholder="Mô tả ngắn về quyền lợi"
              />
            </label>
            <fieldset
              className={cn(
                "grid gap-2 rounded-lg border p-3",
                hasError("membershipIds")
                  ? "border-[#C64040]"
                  : "border-transparent",
              )}
            >
              <legend className="text-sm font-semibold">
                Áp dụng cho hạng
              </legend>
              {tiers.map((tier) => (
                <label
                  key={tier.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-(--admin-text)"
                >
                  <input
                    type="checkbox"
                    checked={form.membershipIds.includes(tier.id)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        membershipIds: event.target.checked
                          ? [...form.membershipIds, tier.id]
                          : form.membershipIds.filter((id) => id !== tier.id),
                      })
                    }
                    className="peer sr-only"
                  />
                  <span className="flex size-4 shrink-0 items-center justify-center rounded border border-(--admin-border) bg-white text-transparent transition-colors peer-checked:border-(--admin-primary) peer-checked:bg-(--admin-primary) peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-(--admin-primary)/25">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {tier.name}
                </label>
              ))}
              {validation.touched.membershipIds &&
              validation.errors.membershipIds ? (
                <span className="text-xs font-medium text-red-600">
                  {validation.errors.membershipIds as string}
                </span>
              ) : null}
            </fieldset>
            <Button
              type="submit"
              disabled={saving}
              className="h-10 bg-(--admin-primary) text-white hover:bg-(--admin-primary-hover)"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Tạo quyền lợi"
              )}
            </Button>
            {message ? (
              <p className="text-sm text-(--admin-text-secondary)">{message}</p>
            ) : null}
          </div>
        </form>
        <section className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3 sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-(--admin-text)">
                Danh sách quyền lợi
              </h2>
              <p className="mt-1 text-sm text-(--admin-text-secondary)">
                {filtered.length} quyền lợi phù hợp
              </p>
            </div>
            <div className="flex w-full min-w-0 gap-2 sm:w-auto">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên hoặc mã"
                className={`${adminInputClassName} min-w-0`}
              />
              <AdminSelect
                name="benefit-status"
                value={status}
                onChange={(value) => setStatus(value as typeof status)}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Đang bật" },
                  { value: "inactive", label: "Đã tắt" },
                ]}
                placeholder="Trạng thái"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {loading ? (
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="min-w-0 rounded-xl border border-(--admin-border) bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid flex-1 gap-2">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-3 w-56 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="mt-4 h-4 w-full rounded-md" />
                  <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
                  <Skeleton className="mt-4 h-3 w-48 rounded-md" />
                  <Skeleton className="mt-4 ml-auto h-8 w-28 rounded-md" />
                </div>
              ))
            ) : filtered.length ? (
              filtered.map((benefit) => (
                <article
                  key={benefit.id}
                  className="min-w-0 rounded-xl border border-(--admin-border) bg-white p-4"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-(--admin-text)">
                        {benefit.name}
                      </h3>
                      <p className="mt-1 truncate text-xs text-(--admin-text-muted)">
                        {benefit.code} ·{" "}
                        {TYPES.find(([value]) => value === benefit.type)?.[1] ||
                          benefit.type}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${benefit.isActive ? "bg-(--admin-primary-soft) text-(--admin-primary)" : "bg-slate-100 text-slate-500"}`}
                    >
                      {benefit.isActive ? "Đang bật" : "Đã tắt"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-(--admin-text-secondary)">
                    {benefit.description || "Chưa có mô tả khách hàng."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--admin-text-muted)">
                    <span>
                      Hạng:{" "}
                      {benefit.tiers.length
                        ? benefit.tiers
                            .map((tier) => tier.membership.name)
                            .join(", ")
                        : "Tất cả / chưa gán"}
                    </span>
                    <span>
                      · Đã dùng: {benefit.usedCount}
                      {benefit.usageLimit ? ` / ${benefit.usageLimit}` : ""}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 border border-(--admin-border) px-3 text-xs"
                      onClick={() => void toggle(benefit)}
                    >
                      {benefit.isActive ? "Tắt quyền lợi" : "Bật quyền lợi"}
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-(--admin-border) px-4 py-8 text-center text-sm text-(--admin-text-muted)">
                Chưa có quyền lợi phù hợp.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminPageContainer>
  );
}
