"use client";

import { AdminPageContainer, AdminPageHeader } from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/Auth/AuthProvider";
import { isValidVietnamesePhone, normalizeVietnamesePhone } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProfileFormValues = {
  displayName: string;
  phone: string;
  email: string;
  password: string;
  currentPassword: string;
};

const emptyForm: ProfileFormValues = { displayName: "", phone: "", email: "", password: "", currentPassword: "" };
const inputClassName = "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! placeholder:text-(--admin-text-muted)! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";
const validationInputClass = (hasError: boolean) => cn(inputClassName, hasError && "border-[#C64040]! focus:border-[#C64040]! focus:ring-red-100!");

const profileValidationSchema = (originalEmail: string) => Yup.object({
  displayName: Yup.string().trim("Tên hiển thị không được có khoảng trắng ở đầu hoặc cuối.").required("Vui lòng nhập tên hiển thị."),
  phone: Yup.string().required("Vui lòng nhập số điện thoại.").test("vietnamese-phone", "Số điện thoại Việt Nam không hợp lệ.", (value) => isValidVietnamesePhone(normalizeVietnamesePhone(value || ""))),
  email: Yup.string().trim("Email không được có khoảng trắng ở đầu hoặc cuối.").email("Email không hợp lệ.").required("Vui lòng nhập email."),
  password: Yup.string().test("new-password", "Mật khẩu phải có ít nhất 8 ký tự.", (value) => !value || value.length >= 8),
  currentPassword: Yup.string().test("sensitive-change-authentication", "Vui lòng nhập mật khẩu hiện tại để xác thực thay đổi.", function (value) {
    const { email, password } = this.parent as ProfileFormValues;
    return email === originalEmail && !password ? true : Boolean(value);
  }),
});

export default function AdminProfilePage() {
  const { user, restoreSession } = useAuth();
  const [initialValues, setInitialValues] = useState(emptyForm);
  const [originalEmail, setOriginalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const validationSchema = useMemo(() => profileValidationSchema(originalEmail), [originalEmail]);

  const save = async (values: ProfileFormValues, helpers: FormikHelpers<ProfileFormValues>) => {
    setMessage("");
    try {
      const sensitiveChange = values.email !== originalEmail || Boolean(values.password);
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: values.displayName, phone: values.phone, email: values.email, password: values.password, ...(sensitiveChange ? { currentPassword: values.currentPassword } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.field) helpers.setFieldError(data.field, data.message);
        setMessage(data.message || "Không thể cập nhật thông tin cá nhân.");
        setMessageType("error");
        return;
      }
      const nextValues = { displayName: data.displayName || "", phone: data.phone || "", email: data.email || "", password: "", currentPassword: "" };
      setInitialValues(nextValues);
      setOriginalEmail(nextValues.email);
      helpers.resetForm({ values: nextValues });
      setMessage("Đã cập nhật thông tin cá nhân.");
      setMessageType("success");
      await restoreSession();
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const formik = useFormik({ initialValues, enableReinitialize: true, validationSchema, onSubmit: save });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/profile");
        const data = await response.json();
        if (response.ok) {
          const nextValues = { displayName: data.displayName || "", phone: data.phone || "", email: data.email || "", password: "", currentPassword: "" };
          setInitialValues(nextValues);
          setOriginalEmail(nextValues.email);
        } else {
          setMessage(data.message || "Không thể tải thông tin cá nhân.");
          setMessageType("error");
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const errorFor = (field: keyof ProfileFormValues) => formik.touched[field] && formik.errors[field] ? formik.errors[field] : "";
  const sensitiveChange = formik.values.email !== originalEmail || Boolean(formik.values.password);

  return (
    <AdminPageContainer>
      <AdminPageHeader title="Thông tin cá nhân" description="Cập nhật thông tin tài khoản quản trị của bạn." />
      <div className="grid w-full max-w-5xl items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-8">
        <section className="admin-surface flex flex-col items-center rounded-2xl p-6 text-center lg:min-h-[260px]">
          {loading ? <Skeleton className="size-20 rounded-full" /> : <span className="flex size-20 items-center justify-center rounded-full bg-(--admin-primary-soft) text-(--admin-primary)"><UserRound className="size-9" /></span>}
          {loading ? <Skeleton className="mt-4 h-4 w-28 rounded-md" /> : <p className="mt-4 font-semibold text-(--admin-text)">{user?.displayName || formik.values.displayName || "Tài khoản"}</p>}
          <p className="mt-1 text-xs text-(--admin-text-muted)">{user?.role === "SUPER_ADMIN" ? "Quản trị viên cấp cao" : "Quản trị viên"}</p>
        </section>
        <div className="grid min-w-0 gap-6">
          {loading ? <section className="admin-surface rounded-2xl p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-10 rounded-lg" /><Skeleton className="h-10 rounded-lg" /><Skeleton className="h-10 rounded-lg sm:col-span-2" /></div></section> : (
            <form onSubmit={formik.handleSubmit} className="grid min-w-0 gap-6" noValidate>
              <section className="admin-surface rounded-2xl p-5 sm:p-7">
                <h2 className="text-base font-semibold text-(--admin-text)">Thông tin tài khoản</h2>
                <p className="mt-1 text-sm text-(--admin-text-secondary)">Cập nhật thông tin cơ bản của tài khoản quản trị.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold"><span>Tên hiển thị</span><Input required {...formik.getFieldProps("displayName")} className={validationInputClass(Boolean(errorFor("displayName")))} aria-invalid={Boolean(errorFor("displayName"))} />{errorFor("displayName") ? <span className="text-xs font-medium text-[#C64040]">{errorFor("displayName")}</span> : null}</label>
                  <label className="grid gap-1.5 text-sm font-semibold"><span>Số điện thoại</span><Input required type="tel" inputMode="tel" {...formik.getFieldProps("phone")} className={validationInputClass(Boolean(errorFor("phone")))} aria-invalid={Boolean(errorFor("phone"))} />{errorFor("phone") ? <span className="text-xs font-medium text-[#C64040]">{errorFor("phone")}</span> : null}</label>
                  <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2"><span>Email</span><Input required type="email" {...formik.getFieldProps("email")} className={validationInputClass(Boolean(errorFor("email")))} aria-invalid={Boolean(errorFor("email"))} />{errorFor("email") ? <span className="text-xs font-medium text-[#C64040]">{errorFor("email")}</span> : null}</label>
                </div>
                <Button type="submit" disabled={formik.isSubmitting || !formik.dirty} className="mt-5 h-10 bg-(--admin-primary) text-white hover:bg-(--admin-primary-hover) sm:w-fit sm:px-6">{formik.isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Đang lưu...</> : "Lưu thông tin"}</Button>
              </section>
              <section className="admin-surface rounded-2xl p-5 sm:p-7">
                <div><h2 className="text-base font-semibold text-(--admin-text)">Đổi mật khẩu</h2><p className="mt-1 text-sm text-(--admin-text-secondary)">Nhập mật khẩu hiện tại để xác thực trước khi đặt mật khẩu mới.</p></div>
                <div className="mt-5 grid gap-4">
                  <label className="grid gap-1.5 text-sm font-semibold"><span>Mật khẩu hiện tại</span><div className="relative"><Input required={sensitiveChange} type={showCurrentPassword ? "text" : "password"} {...formik.getFieldProps("currentPassword")} autoComplete="current-password" placeholder="Nhập mật khẩu hiện tại" className={`${validationInputClass(Boolean(errorFor("currentPassword")))} pr-10!`} aria-invalid={Boolean(errorFor("currentPassword"))} /><button type="button" onClick={() => setShowCurrentPassword((value) => !value)} aria-label={showCurrentPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"} className="absolute inset-y-0 right-3 text-(--admin-text-muted) hover:text-(--admin-primary)">{showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><span className="text-xs font-normal text-(--admin-text-muted)">Bắt buộc khi đổi email hoặc mật khẩu mới.</span>{errorFor("currentPassword") ? <span className="text-xs font-medium text-[#C64040]">{errorFor("currentPassword")}</span> : null}</label>
                  <label className="grid gap-1.5 text-sm font-semibold"><span>Mật khẩu mới</span><div className="relative"><Input type={showPassword ? "text" : "password"} {...formik.getFieldProps("password")} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" className={`${validationInputClass(Boolean(errorFor("password")))} pr-10!`} aria-invalid={Boolean(errorFor("password"))} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"} className="absolute inset-y-0 right-3 text-(--admin-text-muted) hover:text-(--admin-primary)">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><span className="text-xs font-normal text-(--admin-text-muted)">Tối thiểu 8 ký tự và không được trùng mật khẩu hiện tại.</span>{errorFor("password") ? <span className="text-xs font-medium text-[#C64040]">{errorFor("password")}</span> : null}</label>
                  {message ? <p className={cn("text-sm", messageType === "success" ? "text-emerald-700" : "text-[#C64040]")}>{message}</p> : null}
                </div>
                <Button type="submit" disabled={formik.isSubmitting || !formik.dirty} className="mt-5 h-10 bg-(--admin-primary) text-white hover:bg-(--admin-primary-hover) sm:w-fit sm:px-6">{formik.isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Đang đổi...</> : "Đổi mật khẩu"}</Button>
              </section>
            </form>
          )}
        </div>
      </div>
    </AdminPageContainer>
  );
}
