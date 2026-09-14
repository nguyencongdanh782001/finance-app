"use client";

import { AuthDatePicker } from "@/components/Auth/AuthPageClient";
import { useAuth } from "@/components/Auth/AuthProvider";
import AccountLoading from "@/components/Account/AccountLoading";
import AccountSidebar from "@/components/Account/AccountSidebar";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
} from "@/lib/auth/validation";
import { Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "@/hook/use-toast";
import { LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  id: number;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  gender: string | null;
  authProvider: "WEB" | "GOOGLE";
};
type ProfileValues = {
  firstName: string;
  lastName: string;
  displayName: string;
  birthday: string;
  gender: string;
  phone: string;
};
type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
type ApiError = Error & { fieldErrors?: Record<string, string> };

const inputClass =
  "h-11 rounded-xl! border-[#EAE1E4] bg-[#FFFDFC] px-4 shadow-none focus-visible:border-[#D96C8A] focus-visible:ring-[#D96C8A]/20";
const invalidInputClass =
  "!border-[#C64040] focus-visible:!border-[#C64040] focus-visible:!ring-[#C64040]/20";
const profileSchema = Yup.object({
  firstName: Yup.string().trim().required("Vui lòng nhập tên."),
  lastName: Yup.string().trim().required("Vui lòng nhập họ và tên đệm."),
  displayName: Yup.string().trim().required("Vui lòng nhập họ và tên."),
  birthday: Yup.string().test(
    "valid-birthday",
    "Ngày sinh không hợp lệ.",
    (value) => !value || !Number.isNaN(new Date(value).getTime()),
  ),
  gender: Yup.string()
    .oneOf(["FEMALE", "MALE", "OTHER", "UNSPECIFIED"])
    .required("Vui lòng chọn giới tính.")
    .defined("Vui lòng chọn giới tính."),
  phone: Yup.string().test(
    "vietnamese-phone",
    "Số điện thoại Việt Nam không hợp lệ.",
    (value) =>
      !value || isValidVietnamesePhone(normalizeVietnamesePhone(value)),
  ).required("Vui lòng nhập số điện thoại."),
});
const passwordSchema = Yup.object({
  currentPassword: Yup.string(),
  newPassword: Yup.string()
    .required("Vui lòng nhập mật khẩu mới.")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .notOneOf(
      [Yup.ref("currentPassword")],
      "Mật khẩu mới không được trùng mật khẩu hiện tại.",
    ),
  confirmPassword: Yup.string()
    .required("Vui lòng xác nhận mật khẩu mới.")
    .oneOf([Yup.ref("newPassword")], "Mật khẩu xác nhận không khớp."),
});
const request = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "Có lỗi xảy ra.") as ApiError;
    error.fieldErrors = body.fieldErrors;
    throw error;
  }
  return body;
};

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3B2D32]">
      {label}
      {children}
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs font-normal leading-5 text-[#8B7A80]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export default function ProfileAccountPage() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const profileFormik = useFormik<ProfileValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      birthday: "",
      gender: "UNSPECIFIED",
      phone: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values, helpers) => {
      setProfileErrorMessage("");
      try {
        const data = await request("/api/me", {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        setProfile(data);
        helpers.resetForm({
          values: {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            displayName: data.displayName || "",
            birthday: data.birthday?.slice(0, 10) || "",
            gender: data.gender || "UNSPECIFIED",
            phone: data.phone || "",
          },
        });
        toast({
          title: "Đã cập nhật thông tin cá nhân",
          className: "bg-green-16 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
      } catch (error) {
        const apiError = error as ApiError;
        Object.entries(apiError.fieldErrors || {}).forEach(([field, message]) =>
          helpers.setFieldError(field, message),
        );
        setProfileErrorMessage(
          apiError.message || "Không thể cập nhật thông tin.",
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const passwordFormik = useFormik<PasswordValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, helpers) => {
      setPasswordMessage("");
      setPasswordErrorMessage("");
      try {
        await request("/api/me/password", {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        helpers.resetForm();
        setPasswordMessage("Đã đổi mật khẩu thành công.");
      } catch (error) {
        const apiError = error as ApiError;
        Object.entries(apiError.fieldErrors || {}).forEach(([field, message]) =>
          helpers.setFieldError(field, message),
        );
        setPasswordErrorMessage(apiError.message || "Không thể đổi mật khẩu.");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/account/profile")}`,
      );
      return;
    }
    if (isAuthenticated)
      request("/api/me")
        .then((data: Profile) => {
          setProfile(data);
          profileFormik.resetForm({
            values: {
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              displayName: data.displayName || "",
              birthday: data.birthday?.slice(0, 10) || "",
              gender: data.gender || "UNSPECIFIED",
              phone: data.phone || "",
            },
          });
        })
        .catch(() => setLoadError("Không thể tải thông tin cá nhân."));
  }, [isAuthenticated, isInitializing, router]);
  if (isInitializing || !isAuthenticated || !profile) {
    return (
      <AccountLoading
        variant="profile"
        showPassword={user?.authProvider === "WEB"}
      />
    );
  }
  const profileError = (field: keyof ProfileValues) =>
    profileFormik.touched[field] ? profileFormik.errors[field] : undefined;
  const passwordError = (field: keyof PasswordValues) =>
    passwordFormik.touched[field] ? passwordFormik.errors[field] : undefined;
  return (
    <>
      <Toaster />
      <StorefrontShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-sm text-[#6F6066]">
          Trang chủ <span className="px-2">/</span> Tài khoản{" "}
          <span className="px-2">/</span> Thông tin cá nhân
        </div>
        <div className="flex items-start gap-10 xl:gap-14">
          <AccountSidebar profile={profile} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D96C8A]">
              Tài khoản
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Thông tin cá nhân
            </h1>
            <p className="mt-2 text-sm text-[#6F6066]">
              Cập nhật thông tin và bảo mật tài khoản của bạn.
            </p>
            <FormikProvider value={profileFormik}>
              <Form className="mt-8 rounded-2xl border border-[#EAE1E4] bg-white p-5 shadow-[0_8px_24px_rgba(77,47,58,0.04)] sm:p-8">
                <div className="flex items-center gap-3 border-b border-[#F1E9EB] pb-5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#FCEEF3] text-[#D96C8A]">
                    <UserRound className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-extrabold">Thông tin cơ bản</h2>
                    <p className="mt-1 text-xs text-[#8B7A80]">
                      Thông tin hiển thị và liên hệ của bạn.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid items-start gap-5 sm:grid-cols-2">
                  <Field label="Tên" error={profileError("firstName")}>
                    <Input
                      {...profileFormik.getFieldProps("firstName")}
                      onChange={(event) => {
                        const firstName = event.target.value;
                        profileFormik.setFieldValue("firstName", firstName);
                        profileFormik.setFieldValue(
                          "displayName",
                          `${firstName} ${profileFormik.values.lastName}`.trim(),
                        );
                      }}
                      className={`${inputClass} ${profileError("firstName") ? invalidInputClass : ""}`}
                      aria-invalid={Boolean(profileError("firstName"))}
                    />
                  </Field>
                  <Field label="Họ và tên đệm" error={profileError("lastName")}>
                    <Input
                      {...profileFormik.getFieldProps("lastName")}
                      onChange={(event) => {
                        const lastName = event.target.value;
                        profileFormik.setFieldValue("lastName", lastName);
                        profileFormik.setFieldValue(
                          "displayName",
                          `${profileFormik.values.firstName} ${lastName}`.trim(),
                        );
                      }}
                      className={`${inputClass} ${profileError("lastName") ? invalidInputClass : ""}`}
                      aria-invalid={Boolean(profileError("lastName"))}
                    />
                  </Field>
                  <Field label="Ngày sinh" error={profileError("birthday")}>
                    <AuthDatePicker
                      value={profileFormik.values.birthday}
                      hasError={Boolean(profileError("birthday"))}
                      onChange={(birthday) => {
                        profileFormik.setFieldValue("birthday", birthday);
                        profileFormik.setFieldTouched("birthday", true, false);
                      }}
                      className="h-11 rounded-xl! border-[#EAE1E4] bg-[#FFFDFC] shadow-none"
                    />
                  </Field>
                  <Field
                    label="Số điện thoại"
                    error={profileError("phone")}
                  >
                    <Input
                      {...profileFormik.getFieldProps("phone")}
                      type="tel"
                      inputMode="tel"
                      maxLength={10}
                      pattern="0(3|5|7|8|9)[0-9]{8}"
                      onChange={(event) => {
                        profileFormik.setFieldValue(
                          "phone",
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        );
                      }}
                      className={`${inputClass} ${profileError("phone") ? invalidInputClass : ""}`}
                      aria-invalid={Boolean(profileError("phone"))}
                    />
                  </Field>
                  <Field label="Giới tính" error={profileError("gender")}>
                    <Select
                      value={profileFormik.values.gender}
                      onValueChange={(gender) => {
                        profileFormik.setFieldValue("gender", gender);
                        profileFormik.setFieldTouched("gender", true, false);
                      }}
                    >
                      <SelectTrigger
                        className={`${inputClass} ${profileError("gender") ? invalidInputClass : ""}`}
                        aria-invalid={Boolean(profileError("gender"))}
                      >
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNSPECIFIED">
                          Chưa cập nhật
                        </SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                {loadError ? (
                  <p className="mt-5 text-sm font-semibold text-red-600">
                    {loadError}
                  </p>
                ) : null}
                {profileErrorMessage ? (
                  <p className="mt-5 text-sm font-semibold text-red-600">
                    {profileErrorMessage}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="brand"
                  disabled={profileFormik.isSubmitting}
                  className="mt-6 h-11 rounded-xl px-6"
                >
                  {profileFormik.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Form>
            </FormikProvider>
            {profile.authProvider !== "GOOGLE" ? (
              <FormikProvider value={passwordFormik}>
                <Form className="mt-5 rounded-2xl border border-[#EAE1E4] bg-white p-5 shadow-[0_8px_24px_rgba(77,47,58,0.04)] sm:p-8">
                <div className="flex items-center gap-3 border-b border-[#F1E9EB] pb-5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#FCEEF3] text-[#D96C8A]">
                    <LockKeyhole className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-extrabold">Mật khẩu</h2>
                    <p className="mt-1 text-xs text-[#8B7A80]">
                      Dùng ít nhất 8 ký tự để bảo vệ tài khoản.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid gap-5">
                  <Field
                    label="Mật khẩu hiện tại"
                    error={passwordError("currentPassword")}
                  >
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...passwordFormik.getFieldProps("currentPassword")}
                      className={`${inputClass} ${passwordError("currentPassword") ? invalidInputClass : ""}`}
                      aria-invalid={Boolean(passwordError("currentPassword"))}
                    />
                  </Field>
                  <Field
                    label="Mật khẩu mới"
                    error={passwordError("newPassword")}
                  >
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...passwordFormik.getFieldProps("newPassword")}
                      className={`${inputClass} ${passwordError("newPassword") ? invalidInputClass : ""}`}
                      aria-invalid={Boolean(passwordError("newPassword"))}
                    />
                  </Field>
                  <Field
                    label="Xác nhận mật khẩu mới"
                    error={passwordError("confirmPassword")}
                  >
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...passwordFormik.getFieldProps("confirmPassword")}
                      className={`${inputClass} ${passwordError("confirmPassword") ? invalidInputClass : ""}`}
                      aria-invalid={Boolean(passwordError("confirmPassword"))}
                    />
                  </Field>
                </div>
                {passwordErrorMessage ? (
                  <p className="mt-5 text-sm font-semibold text-red-600">
                    {passwordErrorMessage}
                  </p>
                ) : null}
                {passwordMessage ? (
                  <p className="mt-5 text-sm font-semibold text-[#4B8063]">
                    {passwordMessage}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="brand"
                  disabled={passwordFormik.isSubmitting}
                  className="mt-6 h-11 rounded-xl px-6"
                >
                  {passwordFormik.isSubmitting
                    ? "Đang cập nhật..."
                    : "Đổi mật khẩu"}
                </Button>
                </Form>
              </FormikProvider>
            ) : null}
          </div>
        </div>
      </main>
      </StorefrontShell>
    </>
  );
}
