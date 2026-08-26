"use client";

import { Button } from "@/components/ui/button";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const OTP_LENGTH = 6;
const normalizeEmailInput = (value: string) => value.trim().toLowerCase();
const isValidEmailInput = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export default function ForgotPasswordClient() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = normalizeEmailInput(email);

    if (!cleanEmail || !isValidEmailInput(cleanEmail)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await financeAPI.forgotPassword({ email: cleanEmail });

    setIsSubmitting(false);

    if (response.code !== RESPONSE_CODES.success) {
      setError(
        response.data && "message" in response.data
          ? String(response.data.message)
          : "Không thể gửi mã xác thực. Vui lòng thử lại.",
      );
      return;
    }

    setEmail(cleanEmail);
    setDevOtp(response.data?.devOtp || "");
    setMessage("Mã OTP đã được gửi qua email nếu tài khoản tồn tại.");
    setStep("reset");
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.replace(/\D/g, "").length !== OTP_LENGTH) {
      setError("Mã OTP phải gồm 6 số.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const response = await financeAPI.resetPassword({
      email,
      code,
      password,
    });

    setIsSubmitting(false);

    if (response.code !== RESPONSE_CODES.success) {
      setError(
        response.data && "message" in response.data
          ? String(response.data.message)
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
      return;
    }

    setMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
    setDevOtp("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFCFA] px-5 py-8 text-[#1C1A1B]">
      <section className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#7A2944]"
        >
          <ArrowLeft className="size-4" />
          Quay lại đăng nhập
        </Link>

        <div className="rounded-lg border border-[#E9E2E5] bg-white p-6 shadow-[0_24px_70px_rgba(28,26,27,0.08)] sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-xl border border-[#E9E2E5] bg-white shadow-sm">
              <Image
                src="/logo-quynh-nhi-store-mark.svg"
                alt="Quỳnh Nhi Store"
                width={54}
                height={54}
                className="size-12 object-contain"
              />
            </span>
            <div>
              <p className="text-base font-extrabold">Quỳnh Nhi Store</p>
              <p className="text-sm font-semibold text-[#6F686B]">
                Khôi phục tài khoản
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold">
            {step === "email" ? "Quên mật khẩu" : "Đặt mật khẩu mới"}
          </h1>
          <p className="mt-3 text-sm font-medium leading-6 text-[#6F686B]">
            {step === "email"
              ? "Nhập email tài khoản để nhận mã OTP."
              : "Nhập OTP trong email và mật khẩu mới của bạn."}
          </p>

          {step === "email" ? (
            <form className="mt-7 space-y-4" onSubmit={handleRequestReset}>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Mail className="size-4 text-[#D96C8A]" />
                  Email
                </span>
                <input
                  value={email}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Ví dụ: ban@gmail.com"
                  className="h-12 w-full rounded-md border border-[#E9E2E5] bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12"
                />
              </label>
              <Button
                type="submit"
                variant="brand"
                size="auth"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ArrowRight className="size-5" />
                )}
                Gửi mã xác thực
              </Button>
            </form>
          ) : (
            <form className="mt-7 space-y-4" onSubmit={handleResetPassword}>
              {message || devOtp ? (
                <div className="rounded-lg border border-[#E9E2E5] bg-[#FFF3F6] p-4 text-sm font-bold text-[#7A2944]">
                  {message}
                  {devOtp ? (
                    <p className="mt-2 text-[#1C1A1B]">
                      Mã OTP phát triển: {devOtp}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck className="size-4 text-[#D96C8A]" />
                  Mã OTP
                </span>
                <input
                  value={code}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={OTP_LENGTH}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Nhập 6 số"
                  className="h-12 w-full rounded-md border border-[#E9E2E5] bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <LockKeyhole className="size-4 text-[#D96C8A]" />
                  Mật khẩu mới
                </span>
                <input
                  value={password}
                  type="password"
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="h-12 w-full rounded-md border border-[#E9E2E5] bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <LockKeyhole className="size-4 text-[#D96C8A]" />
                  Xác nhận mật khẩu
                </span>
                <input
                  value={confirmPassword}
                  type="password"
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="h-12 w-full rounded-md border border-[#E9E2E5] bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12"
                />
              </label>

              <Button
                type="submit"
                variant="brand"
                size="auth"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ShieldCheck className="size-5" />
                )}
                Đổi mật khẩu
              </Button>
            </form>
          )}

          {error ? (
            <p className="mt-4 rounded-md border border-[#C64040]/20 bg-[#C64040]/8 px-4 py-3 text-sm font-bold text-[#C64040]">
              {error}
            </p>
          ) : null}

          {message && step === "email" ? (
            <p className="mt-4 rounded-md border border-[#E9E2E5] bg-[#FFF3F6] px-4 py-3 text-sm font-bold text-[#7A2944]">
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
