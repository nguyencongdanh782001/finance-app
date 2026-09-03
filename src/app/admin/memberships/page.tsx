"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";

type Tier = {
  id: number;
  name: string;
  code: string;
  level: number;
  color?: string | null;
  icon?: string | null;
  isActive: boolean;
  minSpendAmount: number;
  discountRate: number;
  memberCount?: number;
};
const empty = {
  name: "",
  code: "",
  level: "0",
  minSpendAmount: "0",
  discountRate: "0",
  color: "#D96C8A",
  icon: "",
};
const adminInputClassName =
  "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! placeholder:text-(--admin-text-muted)! outline-none! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";
const adminControlClassName =
  "h-10 w-full rounded-lg border border-(--admin-border) bg-white px-3 text-sm text-(--admin-text) outline-none transition focus:border-(--admin-primary) focus:ring-2 focus:ring-(--admin-primary)/10";
const tierValidationSchema = Yup.object({
  name: Yup.string().trim().required("Vui lòng nhập tên hạng."),
  code: Yup.string().trim().required("Vui lòng nhập mã hạng."),
  level: Yup.number()
    .typeError("Cấp độ phải là số.")
    .min(0, "Cấp độ không được âm.")
    .required("Vui lòng nhập cấp độ."),
  minSpendAmount: Yup.number()
    .typeError("Ngưỡng phải là số.")
    .min(0, "Ngưỡng không được âm.")
    .required("Vui lòng nhập ngưỡng chi tiêu."),
  discountRate: Yup.number()
    .typeError("Tỷ lệ giảm phải là số.")
    .min(0, "Tỷ lệ giảm tối thiểu là 0%.")
    .max(100, "Tỷ lệ giảm tối đa là 100%.")
    .required("Vui lòng nhập tỷ lệ giảm."),
});

export default function MembershipTiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [resetting, setResetting] = useState(false);
  const [loading, setLoading] = useState(true);
  const validation = useFormik({
    initialValues: empty,
    validationSchema: tierValidationSchema,
    onSubmit: async () => undefined,
  });
  const fieldClassName = (field: keyof typeof empty) =>
    cn(
      adminInputClassName,
      validation.touched[field] && validation.errors[field]
        ? "border-[#C64040]! focus:border-[#C64040]! focus:ring-[#C64040]/10!"
        : "",
    );
  const updateField = <K extends keyof typeof empty>(
    field: K,
    value: (typeof empty)[K],
  ) => {
    void validation.setFieldValue(field, value);
    setForm((current) => ({ ...current, [field]: value }));
  };
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/memberships");
      if (response.ok) setTiers(await response.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = await validation.validateForm(form);
    validation.setTouched(
      Object.keys(errors).reduce(
        (result, key) => ({ ...result, [key]: true }),
        {},
      ),
    );
    if (Object.keys(errors).length) return;
    const response = await fetch(
      editing ? `/api/memberships/${editing}` : "/api/memberships",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          level: Number(form.level),
          minSpendAmount: Number(form.minSpendAmount),
          discountRate: Number(form.discountRate),
        }),
      },
    );
    const data = await response.json();
    setMessage(
      response.ok
        ? editing
          ? "Đã cập nhật hạng membership."
          : "Đã tạo hạng membership."
        : data.message || "Không thể lưu hạng.",
    );
    if (response.ok) {
      setEditing(null);
      setForm(empty);
      await load();
    }
  };
  const toggle = async (tier: Tier) => {
    if (tier.isActive && tiers.filter((item) => item.isActive).length <= 1) {
      setMessage("Phải giữ lại ít nhất một hạng đang hoạt động.");
      return;
    }
    if (!window.confirm(`${tier.isActive ? "Tắt" : "Bật"} hạng ${tier.name}?`))
      return;
    await fetch(`/api/memberships/${tier.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !tier.isActive }),
    });
    await load();
  };
  const reset = async () => {
    setResetting(true);
    const response = await fetch("/api/memberships/reset", {
      method: "POST",
      body: "{}",
    });
    const data = await response.json();
    setResetting(false);
    setMessage(
      response.ok
        ? `Đã reset chu kỳ ${data.cycleYear}.`
        : data.message || "Reset thất bại.",
    );
  };
  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Hạng membership"
        description="Cấu hình tier, ngưỡng chi tiêu và ưu đãi mặc định."
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--admin-border) bg-white p-4">
        <div>
          <p className="text-sm font-semibold">Reset chu kỳ hàng năm</p>
          <p className="mt-1 text-xs text-(--admin-text-secondary)">
            Lịch sử cũ được giữ lại khi bắt đầu chu kỳ mới.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          disabled={resetting}
          onClick={() => void reset()}
          className="border border-(--admin-border) text-(--admin-primary)"
        >
          {resetting ? "Đang reset..." : "Chạy reset ngay"}
        </Button>
      </div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form
          onSubmit={submit}
          className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5"
        >
          <h2 className="font-semibold">
            {editing ? "Sửa hạng" : "Tạo hạng mới"}
          </h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold">
              Tên hạng
              <Input
                className={fieldClassName("name")}
                value={form.name}
                onBlur={() => validation.setFieldTouched("name", true)}
                onChange={(e) => updateField("name", e.target.value)}
              />
              {validation.touched.name && validation.errors.name ? (
                <span className="text-xs font-medium text-red-600">
                  {validation.errors.name}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Mã / code
              <Input
                className={fieldClassName("code")}
                value={form.code}
                onBlur={() => validation.setFieldTouched("code", true)}
                onChange={(e) =>
                  updateField("code", e.target.value.toUpperCase())
                }
              />
              {validation.touched.code && validation.errors.code ? (
                <span className="text-xs font-medium text-red-600">
                  {validation.errors.code}
                </span>
              ) : null}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm font-semibold">
                Cấp độ
                <Input
                  type="number"
                  className={fieldClassName("level")}
                  min="0"
                  value={form.level}
                  onBlur={() => validation.setFieldTouched("level", true)}
                  onChange={(e) => updateField("level", e.target.value)}
                />
                {validation.touched.level && validation.errors.level ? (
                  <span className="text-xs font-medium text-red-600">
                    {validation.errors.level}
                  </span>
                ) : null}
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Ngưỡng (đ)
                <NumericInput
                  standalone
                  className={fieldClassName("minSpendAmount")}
                  value={form.minSpendAmount}
                  onManualChange={(value) =>
                    updateField("minSpendAmount", value)
                  }
                  onBlur={() =>
                    validation.setFieldTouched("minSpendAmount", true)
                  }
                  placeholder="0"
                  inputMode="numeric"
                />
                {validation.touched.minSpendAmount &&
                validation.errors.minSpendAmount ? (
                  <span className="text-xs font-medium text-red-600">
                    {validation.errors.minSpendAmount}
                  </span>
                ) : null}
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold">
              Giảm mặc định (%)
              <Input
                type="number"
                className={fieldClassName("discountRate")}
                min="0"
                max="100"
                value={form.discountRate}
                onBlur={() => validation.setFieldTouched("discountRate", true)}
                onChange={(e) => updateField("discountRate", e.target.value)}
              />
              {validation.touched.discountRate &&
              validation.errors.discountRate ? (
                <span className="text-xs font-medium text-red-600">
                  {validation.errors.discountRate}
                </span>
              ) : null}
            </label>
            <div className="grid grid-cols-[1fr_80px] gap-3">
              <label className="grid gap-1 text-sm font-semibold">
                Icon
                <Input
                  className={adminInputClassName}
                  value={form.icon}
                  onChange={(e) => updateField("icon", e.target.value)}
                  placeholder="★"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Màu
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => updateField("color", e.target.value)}
                  className="h-10 w-full rounded-lg border border-(--admin-border) p-1"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="h-10 flex-1 bg-(--admin-primary) text-white"
              >
                {editing ? "Lưu thay đổi" : "Tạo hạng"}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditing(null);
                    setForm(empty);
                  }}
                  className="h-10 border border-(--admin-border)"
                >
                  Hủy
                </Button>
              ) : null}
            </div>
            {message ? (
              <p className="text-sm text-(--admin-text-secondary)">{message}</p>
            ) : null}
          </div>
        </form>
        <section className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5">
          <h2 className="font-semibold">Các hạng hiện có</h2>
          <div className="mt-4 grid gap-3">
            {loading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-(--admin-border) bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="grid flex-1 gap-2">
                        <Skeleton className="h-4 w-32 rounded-md" />
                        <Skeleton className="h-3 w-48 rounded-md" />
                      </div>
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                    <Skeleton className="mt-4 ml-auto h-8 w-24 rounded-md" />
                  </div>
                ))
              : tiers.map((tier) => (
                  <article
                    key={tier.id}
                    className="rounded-xl border border-(--admin-border) bg-white p-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--admin-primary-soft) text-(--admin-primary)">
                          {tier.icon || "★"}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {tier.name}
                          </h3>
                          <p className="truncate text-xs text-(--admin-text-muted)">
                            {tier.code} · Cấp {tier.level} ·{" "}
                            {tier.memberCount || 0} thành viên
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-(--admin-primary)">
                        {tier.isActive ? "Đang bật" : "Đã tắt"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-(--admin-text-secondary)">
                      <span>
                        Từ {Number(tier.minSpendAmount).toLocaleString("vi-VN")}
                        đ
                      </span>
                      <span>Giảm {Number(tier.discountRate)}%</span>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 border border-(--admin-border) px-3 text-xs"
                        onClick={() => {
                          setEditing(tier.id);
                          setForm({
                            name: tier.name,
                            code: tier.code,
                            level: String(tier.level),
                            minSpendAmount: String(tier.minSpendAmount),
                            discountRate: String(tier.discountRate),
                            color: tier.color || "#D96C8A",
                            icon: tier.icon || "",
                          });
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 border border-(--admin-border) px-3 text-xs"
                        onClick={() => void toggle(tier)}
                      >
                        {tier.isActive ? "Tắt" : "Bật"}
                      </Button>
                    </div>
                  </article>
                ))}
          </div>
        </section>
      </div>
    </AdminPageContainer>
  );
}
