"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { AdminSelect } from "@/components/Admin/AdminFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { toast } from "@/hook/use-toast";
import { AuthDatePicker } from "@/components/Auth/AuthPageClient";
import Image from "next/image";
import QRCode from "qrcode";
import { X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

type Coupon = {
  id: number;
  name: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  publicToken: string;
  value: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  usageLimitPerUser?: number | null;
  isActive: boolean;
  status: string;
  firstOrderOnly?: boolean;
  maxDiscountAmount?: number | null;
  membershipDiscounts?: {
    membershipId: number;
    membershipName: string;
    discountRate: number;
  }[];
  source?: "MANUAL" | "BIRTHDAY";
  birthdayYear?: number | null;
  recipientUser?: { displayName: string | null; email: string | null } | null;
  startsAt?: string | null;
  endsAt?: string | null;
};
type Membership = {
  id: number;
  name: string;
  level: number;
  color: string | null;
  isActive?: boolean;
  minSpendAmount?: number | string;
  discountRate?: number | string;
  birthdayMaxDiscountAmount?: number | string | null;
};
type MembershipDiscount = { membershipId: number; discountRate: string };
type DiscountForm = {
  name: string;
  code: string;
  type: string;
  value: string;
  minOrderAmount: string;
  usageLimit: string;
  usageLimitPerUser: string;
  firstOrderOnly: string;
  maxDiscountAmount: string;
  membershipDiscounts: MembershipDiscount[];
  startsAt: string;
  endsAt: string;
};
const initialForm: DiscountForm = {
  name: "",
  code: "",
  type: "PERCENTAGE",
  value: "10",
  minOrderAmount: "",
  usageLimit: "1",
  usageLimitPerUser: "1",
  firstOrderOnly: "false",
  maxDiscountAmount: "",
  membershipDiscounts: [],
  startsAt: "",
  endsAt: "",
};
const randomCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `QN-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
};
const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString("vi-VN") : "Không giới hạn";
const discountLabel = (coupon: Coupon) => {
  const base =
    coupon.type === "PERCENTAGE" ? `${coupon.value}%` : money(coupon.value);
  return coupon.type === "PERCENTAGE" && coupon.maxDiscountAmount
    ? `${base} tối đa ${money(coupon.maxDiscountAmount)}`
    : base;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="min-w-0 text-sm font-semibold text-(--admin-text)">{label}</span>
      {children}
      {hint ? (
        <span className="min-w-0 text-xs leading-5 text-(--admin-text-muted)">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
const inputClassName =
  "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! placeholder:text-(--admin-text-muted)! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipForm, setMembershipForm] = useState({
    name: "",
    level: "0",
    minSpendAmount: "0",
    discountRate: "0",
    birthdayMaxDiscountAmount: "",
  });
  const [membershipMessage, setMembershipMessage] = useState("");
  const [form, setForm] = useState<DiscountForm>(initialForm);
  const [message, setMessage] = useState("");
  const [qr, setQr] = useState<{
    code: string;
    dataUrl: string;
    link: string;
  } | null>(null);
  const load = async () => {
    const [discountResponse, membershipResponse] = await Promise.all([
      fetch("/api/discounts"),
      fetch("/api/memberships"),
    ]);
    if (discountResponse.ok) setCoupons(await discountResponse.json());
    if (membershipResponse.ok) {
      const availableMemberships = await membershipResponse.json();
      setMemberships(
        availableMemberships.filter(
          (membership: Membership) => membership.isActive !== false,
        ),
      );
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const updateForm = (key: keyof DiscountForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const toggleCoupon = async (coupon: Coupon) => {
    await fetch(`/api/discounts/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    await load();
  };
  const showQr = async (coupon: Coupon) => {
    const link = `${window.location.origin}/voucher/${coupon.publicToken}`;
    setQr({
      code: coupon.code,
      link,
      dataUrl: await QRCode.toDataURL(link, { width: 240, margin: 2 }),
    });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        firstOrderOnly: form.firstOrderOnly === "true",
        maxDiscountAmount: form.maxDiscountAmount || undefined,
        membershipDiscounts: form.membershipDiscounts
          .filter((item) => item.discountRate !== "")
          .map((item) => ({
            ...item,
            discountRate: Number(item.discountRate),
          })),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Không thể tạo mã.");
      return;
    }
    setForm(initialForm);
    setMessage("Đã tạo mã giảm giá.");
    toast({
      title: "Đã tạo mã giảm giá",
      description: `Mã ${data.code || form.code} đã sẵn sàng để sử dụng.`,
    });
    await load();
  };
  const updateMembershipDiscount = (
    membershipId: number,
    discountRate: string,
  ) => {
    setForm((current) => {
      const existing = current.membershipDiscounts.filter(
        (item) => item.membershipId !== membershipId,
      );
      return {
        ...current,
        membershipDiscounts:
          discountRate === ""
            ? existing
            : [...existing, { membershipId, discountRate }],
      };
    });
  };
  const membershipRate = (membershipId: number) =>
    form.membershipDiscounts.find((item) => item.membershipId === membershipId)
      ?.discountRate || "";
  const createMembership = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMembershipMessage("");
    const response = await fetch("/api/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(membershipForm),
    });
    const data = await response.json();
    if (!response.ok) {
      setMembershipMessage(data.message || "Không thể tạo hạng membership.");
      return;
    }
    setMembershipForm({
      name: "",
      level: "0",
      minSpendAmount: "0",
      discountRate: "0",
      birthdayMaxDiscountAmount: "",
    });
    setMembershipMessage("Đã thêm hạng membership.");
    toast({
      title: "Đã thêm hạng membership",
      description: `Hạng ${data.name} đã sẵn sàng để cấu hình discount.`,
    });
    await load();
  };

  const renderActions = (coupon: Coupon) => (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="ghost"
        className="h-9 rounded-lg border border-(--admin-border) px-3 text-xs font-semibold"
        onClick={() => void showQr(coupon)}
      >
        Xem QR
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-9 rounded-lg border border-(--admin-border) px-3 text-xs font-semibold"
        onClick={() => void toggleCoupon(coupon)}
      >
        {coupon.isActive ? "Tạm dừng" : "Bật lại"}
      </Button>
    </div>
  );
  return (
    <>
      <Toaster />
      <AdminPageContainer>
        <AdminPageHeader
          title="Mã giảm giá"
          description="Tạo mã giảm giá và thiết lập mức ưu đãi theo từng hạng membership."
        />
        <section className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-(--admin-text)">
                Quản lý membership
              </h2>
              <p className="mt-1 text-sm text-(--admin-text-secondary)">
                Tạo các rank khách hàng và mức ưu đãi mặc định trước khi gắn vào
                mã giảm giá.
              </p>
            </div>
            <span className="rounded-full bg-(--admin-primary-soft) px-2.5 py-1 text-xs font-semibold text-(--admin-primary)">
              {memberships.length} rank đang bật
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.length ? (
              memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="rounded-xl border border-(--admin-border) bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-(--admin-text)">
                      {membership.name}
                    </p>
                    <span className="text-xs font-semibold text-(--admin-primary)">
                      Cấp {membership.level}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-(--admin-text-muted)">
                    <span>
                      Từ {money(Number(membership.minSpendAmount || 0))}
                    </span>
                    <span className="font-bold text-(--admin-primary)">
                      {Number(membership.discountRate || 0)}% mặc định
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-(--admin-border) px-4 py-5 text-center text-sm text-(--admin-text-muted) sm:col-span-2 lg:col-span-3">
                Chưa có rank membership. Tạo rank đầu tiên bên dưới.
              </p>
            )}
          </div>
          <form
            onSubmit={createMembership}
            className="mt-4 grid gap-3 rounded-xl border border-(--admin-border) bg-(--admin-background-subtle) p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_110px_minmax(0,1fr)_130px_minmax(0,1fr)_auto] lg:items-end"
          >
            <Field label="Tên rank">
              <Input
                standalone
                required
                value={membershipForm.name}
                onManualChange={(value) =>
                  setMembershipForm((current) => ({ ...current, name: value }))
                }
                placeholder="Ví dụ: Gold"
                aria-label="Tên rank membership"
                className={inputClassName}
              />
            </Field>
            <Field label="Cấp độ">
              <NumericInput
                standalone
                value={membershipForm.level}
                onManualChange={(value) =>
                  setMembershipForm((current) => ({ ...current, level: value }))
                }
                placeholder="0"
                inputMode="numeric"
                className={inputClassName}
              />
            </Field>
            <Field label="Chi tiêu từ (đ)">
              <NumericInput
                standalone
                value={membershipForm.minSpendAmount}
                onManualChange={(value) =>
                  setMembershipForm((current) => ({
                    ...current,
                    minSpendAmount: value,
                  }))
                }
                placeholder="0"
                inputMode="numeric"
                className={inputClassName}
              />
            </Field>
            <Field label="Ưu đãi (%)">
              <NumericInput
                standalone
                value={membershipForm.discountRate}
                onManualChange={(value) =>
                  setMembershipForm((current) => ({
                    ...current,
                    discountRate: value,
                  }))
                }
                placeholder="0"
                inputMode="numeric"
                className={inputClassName}
              />
            </Field>
            <Field label="Sinh nhật tối đa (đ)">
              <NumericInput
                standalone
                value={membershipForm.birthdayMaxDiscountAmount}
                onManualChange={(value) =>
                  setMembershipForm((current) => ({
                    ...current,
                    birthdayMaxDiscountAmount: value,
                  }))
                }
                placeholder="Không giới hạn"
                inputMode="numeric"
                className={inputClassName}
              />
            </Field>
            <Button
              type="submit"
              className="h-10 rounded-lg bg-(--admin-primary) px-4 font-semibold text-white hover:bg-(--admin-primary-hover)"
            >
              Thêm rank
            </Button>
          </form>
          {membershipMessage ? (
            <p className="mt-3 text-sm text-(--admin-text-secondary)">
              {membershipMessage}
            </p>
          ) : null}
        </section>
        <div className="grid min-w-0 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form
            onSubmit={submit}
            className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5"
          >
            <div className="mb-5 border-b border-(--admin-border) pb-4">
              <p className="text-base font-semibold text-(--admin-text)">
                Tạo mã giảm giá
              </p>
              <p className="mt-1 text-sm leading-5 text-(--admin-text-secondary)">
                Thiết lập ưu đãi mới cho khách hàng.
              </p>
            </div>
            <div className="grid gap-4">
              <Field label="Tên chương trình">
                <Input
                  standalone
                  required
                  value={form.name}
                  onManualChange={(value) => updateForm("name", value)}
                  placeholder="Ví dụ: Ưu đãi khách mới"
                  aria-label="Tên chương trình"
                  className={inputClassName}
                />
              </Field>
              <Field
                label="Mã giảm giá"
                hint="Dùng chữ in hoa, số và dấu gạch ngang để dễ đọc."
              >
                <div className="grid grid-cols-[1fr_auto] w-full min-w-0 gap-2">
                  <Input
                    standalone
                    required
                    value={form.code}
                    onManualChange={(value) =>
                      updateForm("code", value.toUpperCase())
                    }
                    placeholder="Nhập mã giảm giá"
                    aria-label="Mã giảm giá"
                    className={cn(inputClassName, "w-full! min-w-0 uppercase")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-fit rounded-lg border border-(--admin-border) px-3 text-sm font-semibold text-(--admin-primary) hover:bg-(--admin-primary-soft)"
                    onClick={() => updateForm("code", randomCode())}
                  >
                    Tạo mã
                  </Button>
                </div>
              </Field>
              <Field
                label="Đối tượng áp dụng"
                hint="Chỉ định nhóm khách hàng được dùng mã."
              >
                <AdminSelect
                  name="discountAudience"
                  value={form.firstOrderOnly}
                  options={[
                    { value: "false", label: "Tất cả khách hàng" },
                    { value: "true", label: "Khách hàng mới (đơn đầu tiên)" },
                  ]}
                  placeholder="Chọn đối tượng áp dụng"
                  onChange={(value) => updateForm("firstOrderOnly", value)}
                />
              </Field>
              <Field label="Loại giảm giá">
                <AdminSelect
                  name="discountType"
                  value={form.type}
                  options={[
                    { value: "PERCENTAGE", label: "Giảm theo phần trăm (%)" },
                    { value: "FIXED_AMOUNT", label: "Giảm theo số tiền (đ)" },
                  ]}
                  placeholder="Chọn loại giảm giá"
                  onChange={(value) => updateForm("type", value)}
                />
              </Field>
              <Field
                label={
                  form.type === "PERCENTAGE" ? "Mức giảm (%)" : "Mức giảm (đ)"
                }
              >
                <Input
                  standalone
                  required
                  min="1"
                  type="number"
                  value={form.value}
                  onManualChange={(value) => updateForm("value", value)}
                  placeholder={
                    form.type === "PERCENTAGE" ? "Ví dụ: 10" : "Ví dụ: 50000"
                  }
                  aria-label="Giá trị giảm"
                  className={inputClassName}
                />
              </Field>
              {form.type === "PERCENTAGE" ? (
                <Field
                  label="Giảm tối đa (đ)"
                  hint="Ví dụ: giảm 20% nhưng không vượt quá 50.000đ."
                >
                  <NumericInput
                    standalone
                    value={form.maxDiscountAmount}
                    onManualChange={(value) =>
                      updateForm("maxDiscountAmount", value)
                    }
                    placeholder="Không giới hạn"
                    aria-label="Mức giảm tối đa"
                    inputMode="numeric"
                    className={inputClassName}
                  />
                </Field>
              ) : null}
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Field label="Ngày bắt đầu" hint="Để trống nếu mã có hiệu lực ngay.">
                  <AuthDatePicker value={form.startsAt} allowFuture onChange={(value) => { updateForm("startsAt", value); if (form.endsAt && form.endsAt < value) updateForm("endsAt", ""); }} placeholder="Chọn ngày bắt đầu" className={inputClassName} />
                </Field>
                <Field label="Ngày kết thúc" hint="Để trống nếu không đặt ngày hết hạn.">
                  <AuthDatePicker value={form.endsAt} allowFuture minDate={form.startsAt} onChange={(value) => updateForm("endsAt", value)} placeholder="Chọn ngày kết thúc" className={inputClassName} />
                </Field>
              </div>
              {memberships.length ? (
                <div className="rounded-xl border border-(--admin-border) bg-(--admin-background-subtle) p-3 sm:p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-(--admin-text)">
                      Mức giảm theo hạng membership
                    </p>
                    <p className="mt-1 text-xs leading-5 text-(--admin-text-muted)">
                      Để trống hạng không được áp dụng. Mỗi hạng có thể giảm
                      khác nhau.
                    </p>
                  </div>
                  <div className="grid gap-2.5">
                    {memberships.map((membership) => (
                      <div
                        key={membership.id}
                        className="flex min-w-0 items-center gap-3 rounded-lg border border-(--admin-border) bg-white p-2.5"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-(--admin-text)">
                          {membership.name}
                        </span>
                        <div className="flex w-28 shrink-0 items-center gap-1.5">
                          <NumericInput
                            standalone
                            value={membershipRate(membership.id)}
                            onManualChange={(value) =>
                              updateMembershipDiscount(membership.id, value)
                            }
                            placeholder="0"
                            aria-label={`Mức giảm hạng ${membership.name}`}
                            inputMode="numeric"
                            className={cn(inputClassName, "text-right")}
                          />
                          <span className="text-sm font-semibold text-(--admin-text-muted)">
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Đơn tối thiểu (đ)" hint="Giá trị tối thiểu là 0.">
                  <NumericInput
                    standalone
                    value={form.minOrderAmount}
                    onManualChange={(value) =>
                      updateForm("minOrderAmount", value)
                    }
                    placeholder="0"
                    aria-label="Đơn tối thiểu"
                    inputMode="numeric"
                    className={inputClassName}
                  />
                </Field>
                <Field
                  label="Giới hạn lượt dùng"
                  hint="Tổng số lượt dùng của mã."
                >
                  <NumericInput
                    standalone
                    value={form.usageLimit}
                    onManualChange={(value) => updateForm("usageLimit", value)}
                    placeholder="1"
                    aria-label="Giới hạn lượt dùng"
                    inputMode="numeric"
                    className={inputClassName}
                  />
                </Field>
                <Field
                  label="Mỗi tài khoản dùng"
                  hint="Mặc định 1 lần cho mỗi account."
                >
                  <NumericInput
                    standalone
                    value={form.usageLimitPerUser}
                    onManualChange={(value) =>
                      updateForm("usageLimitPerUser", value)
                    }
                    placeholder="1"
                    aria-label="Giới hạn mỗi tài khoản"
                    inputMode="numeric"
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
            {message ? (
              <p className="mt-4 rounded-lg bg-(--admin-background-subtle) px-3 py-2 text-sm text-(--admin-text-secondary)">
                {message}
              </p>
            ) : null}
            <Button
              type="submit"
              className="mt-5 h-10 w-full rounded-lg bg-(--admin-primary) font-semibold text-white hover:bg-(--admin-primary-hover)"
            >
              Lưu mã giảm giá
            </Button>
          </form>
          <section className="admin-surface min-w-0 rounded-2xl p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-(--admin-text)">
                Danh sách mã
              </h2>
              <p className="mt-1 text-sm text-(--admin-text-secondary)">
                {coupons.length} mã giảm giá
              </p>
            </div>
            <div className="hidden overflow-x-auto rounded-xl border border-(--admin-border) md:block">
              <table className="w-full min-w-205 text-left text-sm">
                <thead>
                  <tr className="bg-(--admin-background-subtle) text-(--admin-text-muted)">
                    <th className="p-3 font-semibold">Chương trình</th>
                    <th className="p-3 font-semibold">Mã</th>
                    <th className="p-3 font-semibold">Giảm</th>
                    <th className="p-3 font-semibold">Đã dùng</th>
                    <th className="p-3 font-semibold">Trạng thái</th>
                    <th className="p-3 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-t border-(--admin-border) text-(--admin-text-secondary)"
                    >
                      <td className="p-3 font-medium text-(--admin-text)">
                        {coupon.name}
                        {coupon.source === "BIRTHDAY" ? (
                          <span className="mt-1 block text-xs font-normal text-(--admin-primary)">
                            Sinh nhật ·{" "}
                            {coupon.recipientUser?.email || "khách hàng"}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3 font-semibold text-(--admin-primary)">
                        {coupon.code}
                      </td>
                      <td className="p-3">
                        {discountLabel(coupon)}
                        {coupon.membershipDiscounts?.length ? (
                          <span className="mt-1 block text-xs text-(--admin-text-muted)">
                            Theo {coupon.membershipDiscounts.length} hạng
                          </span>
                        ) : null}
                        <span className="mt-1 block text-xs text-(--admin-text-muted)">
                          {dateLabel(coupon.startsAt)} – {dateLabel(coupon.endsAt)}
                        </span>
                      </td>
                      <td className="p-3">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-(--admin-primary-soft) px-2 py-1 text-xs font-semibold text-(--admin-primary)">
                          {coupon.status}
                        </span>
                      </td>
                      <td className="p-3">{renderActions(coupon)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 md:hidden">
              {coupons.length ? (
                coupons.map((coupon) => (
                  <article
                    key={coupon.id}
                    className="rounded-xl border border-(--admin-border) bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-(--admin-text)">
                          {coupon.name}
                        </p>
                        {coupon.source === "BIRTHDAY" ? (
                          <p className="mt-1 text-xs text-(--admin-primary)">
                            🎂 Sinh nhật ·{" "}
                            {coupon.recipientUser?.email || "khách hàng"}
                          </p>
                        ) : null}
                        <p className="mt-1 inline-flex rounded-md bg-(--admin-primary-soft) px-2 py-1 font-mono text-xs font-bold tracking-wide text-(--admin-primary)">
                          {coupon.code}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-(--admin-primary-soft) px-2 py-1 text-11px font-semibold text-(--admin-primary)">
                        {coupon.status}
                      </span>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-(--admin-border) py-3 text-sm">
                      <div>
                        <dt className="text-xs text-(--admin-text-muted)">
                          Mức giảm
                        </dt>
                        <dd className="mt-0.5 font-semibold text-(--admin-text)">
                          {discountLabel(coupon)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-(--admin-text-muted)">
                          Đã dùng
                        </dt>
                        <dd className="mt-0.5 font-semibold text-(--admin-text)">
                          {coupon.usedCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </dd>
                      </div>
                    </dl>
                    {coupon.membershipDiscounts?.length ? (
                      <p className="mt-3 text-xs text-(--admin-text-muted)">
                        Áp dụng theo{" "}
                        {coupon.membershipDiscounts
                          .map(
                            (item) =>
                              `${item.membershipName} ${item.discountRate}%`,
                          )
                          .join(" · ")}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-(--admin-text-muted)">
                      Hiệu lực: {dateLabel(coupon.startsAt)} – {dateLabel(coupon.endsAt)}
                    </p>
                    <div className="mt-3">{renderActions(coupon)}</div>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-(--admin-border) px-4 py-8 text-center text-sm text-(--admin-text-muted)">
                  Chưa có mã giảm giá.
                </p>
              )}
            </div>
            {qr ? (
              <div className="relative mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-(--admin-border) bg-(--admin-background-subtle) p-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-2 top-2 text-(--admin-text-muted) hover:bg-white hover:text-(--admin-text)"
                  onClick={() => setQr(null)}
                  aria-label="Ẩn mã QR"
                >
                  <X className="size-4" />
                </Button>
                <Image
                  src={qr.dataUrl}
                  alt={`QR ${qr.code}`}
                  width={160}
                  height={160}
                  unoptimized
                  className="size-40 rounded-lg bg-white p-2"
                />
                <div className="min-w-0 pr-5">
                  <p className="font-bold text-(--admin-text)">{qr.code}</p>
                  <p className="mt-1 max-w-md break-all text-xs text-(--admin-text-muted)">
                    {qr.link}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      className="rounded-lg bg-(--admin-primary) px-3 py-2 text-sm font-semibold text-white"
                      href={qr.dataUrl}
                      download={`${qr.code}.png`}
                    >
                      Tải PNG
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        void navigator.clipboard?.writeText(qr.link)
                      }
                    >
                      Sao chép link
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </AdminPageContainer>
    </>
  );
}
