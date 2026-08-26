"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { AuthPurpose } from "@/interface/auth";
import { useAuth } from "@/components/Auth/AuthProvider";
import {
  getDefaultRouteByRole,
  getRouteAfterAuth,
  getSafeReturnPath,
  isAdminRole,
} from "@/lib/auth/routing";
import { isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import {
  ArrowRight,
  Cake,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type AuthMode = "login" | "register";
type Step = "phone" | "otp";
type UserGender = "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";
type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword"
  | "birthday"
  | "gender"
  | "code";
type FieldErrors = Partial<Record<FieldName, string>>;
const OTP_LENGTH = 6;
const createEmptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");
const GENDER_OPTIONS: Array<{ value: UserGender; label: string }> = [
  { value: "FEMALE", label: "Nữ" },
  { value: "MALE", label: "Nam" },
  { value: "OTHER", label: "Khác" },
  { value: "UNSPECIFIED", label: "Không muốn chia sẻ" },
];
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
  }
}
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index),
  label: `Tháng ${index + 1}`,
}));

const modeContent = {
  login: {
    title: "Đăng nhập",
    eyebrow: "Tài khoản",
    subtitle: "Nhập email và mật khẩu để nhận mã xác thực.",
    action: "Đăng nhập",
    otpAction: "Xác nhận đăng nhập",
  },
  register: {
    title: "Tạo tài khoản",
    eyebrow: "Tài khoản mới",
    subtitle: "Tạo mật khẩu và xác thực email bằng mã OTP.",
    action: "Gửi mã đăng ký",
    otpAction: "Hoàn tất đăng ký",
  },
};

const normalizeEmailInput = (value: string) => value.trim().toLowerCase();

const isValidEmailInput = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.5c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.6-4.9 3.6-8.2z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.8c-1 .7-2.4 1.1-4.2 1.1-3.1 0-5.7-2.1-6.7-4.9H1.5v2.9C3.4 21.3 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.5c-.2-.7-.4-1.5-.4-2.5s.1-1.7.4-2.5V6.6H1.5C.6 8.2 0 10.1 0 12s.6 3.8 1.5 5.4l3.8-2.9z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.7 0 3.3.6 4.5 1.8l3.3-3.3C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.5 6.6l3.8 2.9c1-2.8 3.6-4.8 6.7-4.8z"
      />
    </svg>
  );
}

const getEmailDeliveryMessage = (
  emailDelivery:
    | {
        sent: boolean;
        skipped: boolean;
        error?: string;
      }
    | undefined,
  fallback: string,
) => {
  if (emailDelivery?.sent) {
    return fallback;
  }

  if (emailDelivery?.skipped) {
    return "Mã OTP đã được tạo cho môi trường phát triển.";
  }

  if (emailDelivery?.error) {
    return `Gmail chưa gửi được OTP: ${emailDelivery.error}`;
  }

  return fallback;
};

const formatBirthdayLabel = (value: string) => {
  if (!value) {
    return "Chọn ngày sinh";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chọn ngày sinh";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function AuthSelect({
  value,
  options,
  placeholder,
  hasError,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  hasError?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="authField"
          size="authField"
          aria-invalid={hasError}
          className={hasError ? "border-[#C64040]" : ""}
        >
          <span
            className={selectedOption ? "text-[#1C1A1B]" : "text-[#9B9296]"}
          >
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="size-5 text-[#9B9296]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) rounded-lg border-[#E9E2E5] bg-white p-1 shadow-[0_18px_50px_rgba(28,26,27,0.12)]"
      >
        <Command>
          <CommandInput
            icon={<VenusAndMars className="size-4 text-[#D96C8A]" />}
            placeholder="Tìm giới tính"
            className="h-10"
          />
          <CommandList>
            <CommandEmpty>Không có lựa chọn phù hợp</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-2.5 font-semibold text-[#1C1A1B]"
                >
                  <Check
                    className={`size-4 ${
                      value === option.value ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DatePickerSelect({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="authField"
          size="authField"
          aria-label={ariaLabel}
          className="h-10 rounded-md px-3 text-sm shadow-none"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown className="size-4 text-[#9B9296]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-64 w-(--radix-dropdown-menu-trigger-width) rounded-lg border-[#E9E2E5]"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="justify-between rounded-md font-semibold"
          >
            {option.label}
            {option.value === value ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthDatePicker({
  value,
  hasError,
  onChange,
}: {
  value: string;
  hasError?: boolean;
  onChange: (value: string) => void;
}) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const selectedDate = value ? new Date(value) : null;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate && !Number.isNaN(selectedDate.getTime())
      ? selectedDate
      : today,
  );
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const yearOptions = Array.from({ length: 101 }, (_, index) => {
    const optionYear = currentYear - index;

    return {
      value: String(optionYear),
      label: String(optionYear),
    };
  });

  const moveMonth = (offset: number) => {
    setViewDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() + offset, 1);
    });
  };

  const handleMonthChange = (nextMonth: string) => {
    setViewDate((current) => {
      return new Date(current.getFullYear(), Number(nextMonth), 1);
    });
  };

  const handleYearChange = (nextYear: string) => {
    setViewDate((current) => {
      return new Date(Number(nextYear), current.getMonth(), 1);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="authField"
          size="authField"
          aria-invalid={hasError}
          className={hasError ? "border-[#C64040]" : ""}
        >
          <span className={value ? "text-[#1C1A1B]" : "text-[#9B9296]"}>
            {formatBirthdayLabel(value)}
          </span>
          <ChevronDown className="size-5 text-[#9B9296]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-97.5 max-w-[calc(100vw-32px)] rounded-lg border-[#E9E2E5] bg-white p-4 shadow-[0_18px_50px_rgba(28,26,27,0.12)] max-sm:bottom-3! max-sm:left-3! max-sm:right-3! max-sm:top-auto! max-sm:w-auto! max-sm:max-w-none! max-sm:translate-x-0! max-sm:translate-y-0! max-sm:rounded-2xl max-sm:p-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => moveMonth(-1)}
              aria-label="Tháng trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="min-w-0 flex-1 text-center text-sm font-extrabold text-[#1C1A1B]">
              Chọn ngày sinh
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => moveMonth(1)}
              aria-label="Tháng sau"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="grid min-w-0 grid-cols-[1fr_0.82fr] gap-2">
            <DatePickerSelect
              value={String(month)}
              options={MONTH_OPTIONS}
              ariaLabel="Chọn tháng"
              onChange={handleMonthChange}
            />
            <DatePickerSelect
              value={String(year)}
              options={yearOptions}
              ariaLabel="Chọn năm"
              onChange={handleYearChange}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <span key={day} className="py-1 text-xs font-bold text-[#9B9296]">
              {day}
            </span>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return <span key={`empty-${index}`} />;
            }

            const date = new Date(year, month, day);
            const dateValue = toDateValue(date);
            const isSelected = value === dateValue;
            const isFuture = date > today;

            return (
              <Button
                key={dateValue}
                type="button"
                variant={isSelected ? "authTabActive" : "ghost"}
                size="icon-sm"
                disabled={isFuture}
                onClick={() => {
                  onChange(dateValue);
                  setOpen(false);
                }}
                className={`mx-auto size-9 text-sm font-bold ${
                  isFuture
                    ? "cursor-not-allowed text-[#D8C8CE]"
                    : "text-[#1C1A1B] hover:bg-[#FFF3F6]"
                }`}
              >
                {day}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AuthPageClient({
  initialMode,
}: {
  initialMode: AuthMode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isInitializing, setAuthenticatedSession } =
    useAuth();
  const redirectTo = getSafeReturnPath(searchParams.get("redirect"));
  const isLoginOrRegister = pathname === "/login" || pathname === "/register";
  const shouldRedirectAuthenticatedUser =
    isLoginOrRegister || (pathname === "/" && isAdminRole(user?.role));
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<Step>("phone");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<UserGender | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(createEmptyOtp);
  const [otpPurpose, setOtpPurpose] = useState<AuthPurpose>("REGISTER");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isGoogleButtonRendered, setIsGoogleButtonRendered] = useState(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const content = modeContent[mode];
  const otpTitle =
    otpPurpose === "LOGIN" ? "Xác thực đăng nhập" : "Xác thực email";
  const otpSubtitle =
    otpPurpose === "LOGIN"
      ? "Nhập mã OTP đã gửi qua email để hoàn tất đăng nhập."
      : "Nhập mã OTP đã gửi qua email để hoàn tất đăng ký.";
  const otpAction =
    otpPurpose === "LOGIN" ? "Xác thực và đăng nhập" : content.otpAction;

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !user) {
      return;
    }

    if (!shouldRedirectAuthenticatedUser) {
      return;
    }

    const destination = getDefaultRouteByRole(user.role);

    if (pathname !== destination) {
      router.replace(destination);
    }
  }, [
    isAuthenticated,
    isInitializing,
    pathname,
    router,
    shouldRedirectAuthenticatedUser,
    user,
  ]);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setIsSubmitting(true);
      setError("");
      setMessage("");

      const response = await financeAPI.googleLogin({ credential });

      setIsSubmitting(false);

      if (
        response.code !== RESPONSE_CODES.success ||
        !response.data?.accessToken ||
        !response.data.user
      ) {
        setError(
          response.data && "message" in response.data
            ? String(response.data.message)
            : "Không thể đăng nhập bằng Google. Vui lòng thử lại.",
        );
        return;
      }

      setAuthenticatedSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      });
      router.replace(getRouteAfterAuth(response.data.user, redirectTo));
    },
    [redirectTo, router, setAuthenticatedSession],
  );

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) {
            void handleGoogleCredential(response.credential);
          }
        },
      });
      setIsGoogleReady(true);
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: googleButtonRef.current.clientWidth || 360,
        text: mode === "login" ? "signin_with" : "signup_with",
      });
      window.setTimeout(() => {
        setIsGoogleButtonRendered(
          Boolean(googleButtonRef.current?.childElementCount),
        );
      }, 300);
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      setIsGoogleReady(false);
      setIsGoogleButtonRendered(false);
    };
    document.head.appendChild(script);
  }, [handleGoogleCredential, mode]);

  const handleGoogleFallbackClick = () => {
    if (!window.google || !isGoogleReady) {
      setError("Google Login chưa sẵn sàng. Vui lòng thử lại sau vài giây.");
      return;
    }

    setError("");
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setError(
          "Google chưa mở được cửa sổ đăng nhập. Vui lòng kiểm tra cấu hình Google Client ID và domain.",
        );
      }
    });
  };

  const validateCredentials = () => {
    const cleanEmail = normalizeEmailInput(email);
    const nextErrors: FieldErrors = {};

    if (mode === "register" && !lastName.trim()) {
      nextErrors.lastName = "Vui lòng nhập họ.";
    }

    if (mode === "register" && !firstName.trim()) {
      nextErrors.firstName = "Vui lòng nhập tên.";
    }

    if (mode === "register" && !birthday) {
      nextErrors.birthday = "Vui lòng chọn ngày sinh.";
    } else if (mode === "register") {
      const birthdayDate = new Date(birthday);

      if (Number.isNaN(birthdayDate.getTime())) {
        nextErrors.birthday = "Ngày sinh không hợp lệ.";
      } else if (birthdayDate > new Date()) {
        nextErrors.birthday = "Ngày sinh không được lớn hơn ngày hiện tại.";
      }
    }

    if (mode === "register" && !gender) {
      nextErrors.gender = "Vui lòng chọn giới tính.";
    }

    if (!cleanEmail) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!isValidEmailInput(cleanEmail)) {
      nextErrors.email = "Email không hợp lệ.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (!isValidPassword(password)) {
      nextErrors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }

    if (mode === "register") {
      if (!confirmPassword) {
        nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      }
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validateOtp = () => {
    const nextErrors: FieldErrors = {};
    const code = otpDigits.join("");

    if (!code) {
      nextErrors.code = "Vui lòng nhập mã OTP.";
    } else if (code.length !== OTP_LENGTH) {
      nextErrors.code = "Mã OTP phải gồm 6 số.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep("phone");
    setOtpDigits(createEmptyOtp());
    setOtpPurpose("REGISTER");
    setDevOtp("");
    setMessage("");
    setError("");
    setFieldErrors({});
  };

  const focusOtpInput = (index: number) => {
    otpInputRefs.current[index]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");

    setFieldErrors((prev) => ({ ...prev, code: undefined }));

    if (!digits) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";

        return next;
      });
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];

      digits
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });

      return next;
    });

    focusOtpInput(Math.min(index + digits.length, OTP_LENGTH - 1));
  };

  const handleOtpKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Backspace" || otpDigits[index]) {
      return;
    }

    focusOtpInput(Math.max(index - 1, 0));
  };

  const handleOtpPaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");

    if (!digits) {
      return;
    }

    event.preventDefault();
    handleOtpChange(index, digits);
  };

  const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = normalizeEmailInput(email);

    if (!validateCredentials()) {
      setError("");
      return;
    }

    if (mode === "register" && !gender) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    if (mode === "login") {
      const response = await financeAPI.login({
        email: cleanEmail,
        password,
      });

      setIsSubmitting(false);

      const verificationPayload = response.data?.requiresEmailVerification
        ? response.data
        : undefined;
      const requiresEmailVerification =
        response.code === "202" || Boolean(verificationPayload);

      if (requiresEmailVerification) {
        setEmail(cleanEmail);
        setOtpPurpose("LOGIN");
        setOtpDigits(createEmptyOtp());
        setDevOtp(verificationPayload?.devOtp || "");
        setStep("otp");
        setMessage(
          verificationPayload?.email?.sent
            ? "Mã OTP đã được gửi qua email."
            : getEmailDeliveryMessage(
                verificationPayload?.email,
                "Mã OTP đã được gửi qua email.",
              ),
        );
        return;
      }

      if (response.code !== RESPONSE_CODES.success) {
        setError(
          response.data && "message" in response.data
            ? String(response.data.message)
            : "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.",
        );
        return;
      }

      if (!response.data?.accessToken || !response.data.user) {
        setError("Không thể đăng nhập. Vui lòng thử lại.");
        return;
      }

      setAuthenticatedSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      });
      router.replace(getRouteAfterAuth(response.data.user, redirectTo));
      return;
    }

    const response = await financeAPI.register({
      email: cleanEmail,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthday,
      gender: gender || "UNSPECIFIED",
    });

    setIsSubmitting(false);

    if (response.code !== RESPONSE_CODES.success) {
      setError(
        response.data && "message" in response.data
          ? String(response.data.message)
          : "Không thể gửi mã OTP. Vui lòng thử lại.",
      );
      return;
    }

    if (response.data?.accessToken && response.data.user) {
      setAuthenticatedSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      });
      router.replace(getRouteAfterAuth(response.data.user, redirectTo));
      return;
    }

    setEmail(cleanEmail);
    setOtpPurpose("REGISTER");
    setOtpDigits(createEmptyOtp());
    setDevOtp(response.data?.devOtp || "");
    setStep("otp");
    setMessage(
      getEmailDeliveryMessage(
        response.data?.email,
        "Mã OTP đã được gửi qua email.",
      ),
    );
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanCode = otpDigits.join("");

    if (!validateOtp()) {
      setError("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await financeAPI.verifyOtp({
      email,
      code: cleanCode,
      purpose: otpPurpose,
    });

    setIsSubmitting(false);

    const verifiedSession = response.data;

    if (
      response.code !== RESPONSE_CODES.success ||
      !verifiedSession?.accessToken ||
      !verifiedSession.user
    ) {
      setError(
        response.data && "message" in response.data
          ? String(response.data.message)
          : "Mã OTP không đúng hoặc đã hết hạn.",
      );
      return;
    }

    setAuthenticatedSession({
      accessToken: verifiedSession.accessToken,
      user: verifiedSession.user,
    });
    router.replace(getRouteAfterAuth(verifiedSession.user, redirectTo));
  };

  if (isInitializing || (isAuthenticated && shouldRedirectAuthenticatedUser)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCFA] px-5 text-[#1C1A1B]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-[#E9E2E5] bg-white shadow-sm">
            <Loader2 className="size-5 animate-spin text-[#D96C8A]" />
          </span>
          <p className="text-sm font-bold text-[#6F686B]">
            Đang kiểm tra tài khoản
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCFA] text-[#1C1A1B]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#FFF3F6] lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF3F6_48%,#F7DEE6_100%)]" />
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-[#D96C8A]/20" />
          <div className="absolute bottom-24 right-16 h-56 w-56 rounded-full border border-[#7A2944]/10" />
          <Image
            src="/logo-quynh-nhi-store.svg"
            alt="Quỳnh Nhi Store"
            width={700}
            height={260}
            priority
            className="absolute left-1/2 top-[42%] h-auto w-[68%] max-w-2xl -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_24px_60px_rgba(122,41,68,0.16)]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/88 to-transparent p-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7A2944]">
              Quỳnh Nhi Store
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight text-[#1C1A1B]">
              Mua sắm thời trang nhẹ nhàng, tinh tế và dễ dàng hơn mỗi ngày.
            </h2>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {["Đơn hàng", "Ưu đãi", "Tài khoản"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#E9E2E5] bg-white/75 p-4 shadow-sm"
                >
                  <CheckCircle2 className="size-5 text-[#D96C8A]" />
                  <p className="mt-3 text-sm font-semibold text-[#1C1A1B]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <Link
                href="/"
                className="flex min-w-0 cursor-pointer items-center justify-center gap-3 sm:justify-start"
              >
                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E9E2E5] bg-white p-0 shadow-sm sm:size-12">
                  <Image
                    src="/logo-quynh-nhi-store-mark.svg"
                    alt="Quỳnh Nhi Store"
                    width={76}
                    height={76}
                    priority
                    className="h-[125%] w-[125%] max-w-none object-contain"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-extrabold leading-tight text-[#1C1A1B] sm:text-sm">
                    Quỳnh Nhi Store
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-[#6F686B] sm:text-xs">
                    Tài khoản của bạn
                  </span>
                </span>
              </Link>
              <div className="grid w-full grid-cols-2 rounded-lg border border-[#E9E2E5] bg-white p-1 sm:w-auto">
                <Button
                  type="button"
                  variant={mode === "login" ? "authTabActive" : "authTab"}
                  size="authTab"
                  onClick={() => handleModeChange("login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="button"
                  variant={mode === "register" ? "authTabActive" : "authTab"}
                  size="authTab"
                  onClick={() => handleModeChange("register")}
                >
                  Đăng ký
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-[#E9E2E5] bg-white p-6 shadow-[0_24px_70px_rgba(28,26,27,0.08)] sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#FFF3F6]">
                  <Sparkles className="size-5 text-[#D96C8A]" />
                </span>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7A2944]">
                  {content.eyebrow}
                </p>
              </div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[#1C1A1B]">
                {step === "otp" ? otpTitle : content.title}
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-[#6F686B]">
                {step === "otp" ? otpSubtitle : content.subtitle}
              </p>

              {step === "phone" ? (
                <form className="mt-7 space-y-4" onSubmit={handleRequestOtp}>
                  {mode === "register" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                          <UserRound className="size-4 text-[#D96C8A]" />
                          Họ
                        </span>
                        <input
                          value={lastName}
                          onChange={(event) => {
                            setLastName(event.target.value);
                            setFieldErrors((prev) => ({
                              ...prev,
                              lastName: undefined,
                            }));
                          }}
                          placeholder="Ví dụ: Nguyễn"
                          aria-invalid={Boolean(fieldErrors.lastName)}
                          className={`h-12 w-full rounded-md border bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12 ${
                            fieldErrors.lastName
                              ? "border-[#C64040]"
                              : "border-[#E9E2E5]"
                          }`}
                        />
                        {fieldErrors.lastName ? (
                          <p className="mt-2 text-sm font-semibold text-[#C64040]">
                            {fieldErrors.lastName}
                          </p>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                          <UserRound className="size-4 text-[#D96C8A]" />
                          Tên
                        </span>
                        <input
                          value={firstName}
                          onChange={(event) => {
                            setFirstName(event.target.value);
                            setFieldErrors((prev) => ({
                              ...prev,
                              firstName: undefined,
                            }));
                          }}
                          placeholder="Ví dụ: Quỳnh Nhi"
                          aria-invalid={Boolean(fieldErrors.firstName)}
                          className={`h-12 w-full rounded-md border bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12 ${
                            fieldErrors.firstName
                              ? "border-[#C64040]"
                              : "border-[#E9E2E5]"
                          }`}
                        />
                        {fieldErrors.firstName ? (
                          <p className="mt-2 text-sm font-semibold text-[#C64040]">
                            {fieldErrors.firstName}
                          </p>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                          <Cake className="size-4 text-[#D96C8A]" />
                          Ngày sinh
                        </span>
                        <AuthDatePicker
                          value={birthday}
                          hasError={Boolean(fieldErrors.birthday)}
                          onChange={(nextBirthday) => {
                            setBirthday(nextBirthday);
                            setFieldErrors((prev) => ({
                              ...prev,
                              birthday: undefined,
                            }));
                          }}
                        />
                        {fieldErrors.birthday ? (
                          <p className="mt-2 text-sm font-semibold text-[#C64040]">
                            {fieldErrors.birthday}
                          </p>
                        ) : null}
                      </label>

                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                          <VenusAndMars className="size-4 text-[#D96C8A]" />
                          Giới tính
                        </span>
                        <AuthSelect
                          value={gender}
                          options={GENDER_OPTIONS}
                          placeholder="Chọn giới tính"
                          hasError={Boolean(fieldErrors.gender)}
                          onChange={(nextGender) => {
                            setGender(nextGender as UserGender);
                            setFieldErrors((prev) => ({
                              ...prev,
                              gender: undefined,
                            }));
                          }}
                        />
                        {fieldErrors.gender ? (
                          <p className="mt-2 text-sm font-semibold text-[#C64040]">
                            {fieldErrors.gender}
                          </p>
                        ) : null}
                      </label>
                    </div>
                  ) : null}

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                      <Mail className="size-4 text-[#D96C8A]" />
                      Email
                    </span>
                    <input
                      value={email}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }}
                      placeholder="Ví dụ: ban@gmail.com"
                      aria-invalid={Boolean(fieldErrors.email)}
                      className={`h-12 w-full rounded-md border bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12 ${
                        fieldErrors.email
                          ? "border-[#C64040]"
                          : "border-[#E9E2E5]"
                      }`}
                    />
                    {fieldErrors.email ? (
                      <p className="mt-2 text-sm font-semibold text-[#C64040]">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                      <LockKeyhole className="size-4 text-[#D96C8A]" />
                      Mật khẩu
                    </span>
                    <input
                      value={password}
                      type="password"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }}
                      placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
                      aria-invalid={Boolean(fieldErrors.password)}
                      className={`h-12 w-full rounded-md border bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12 ${
                        fieldErrors.password
                          ? "border-[#C64040]"
                          : "border-[#E9E2E5]"
                      }`}
                    />
                    {fieldErrors.password ? (
                      <p className="mt-2 text-sm font-semibold text-[#C64040]">
                        {fieldErrors.password}
                      </p>
                    ) : null}
                  </label>

                  {mode === "login" ? (
                    <div className="flex justify-end">
                      <Button asChild variant="linkBrand">
                        <Link href="/forgot-password">Quên mật khẩu?</Link>
                      </Button>
                    </div>
                  ) : null}

                  {mode === "register" ? (
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                        <ShieldCheck className="size-4 text-[#D96C8A]" />
                        Xác nhận mật khẩu
                      </span>
                      <input
                        value={confirmPassword}
                        type="password"
                        autoComplete="new-password"
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: undefined,
                          }));
                        }}
                        placeholder="Nhập lại mật khẩu"
                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                        className={`h-12 w-full rounded-md border bg-[#FFFCFA] px-4 text-base font-semibold outline-none transition placeholder:text-[#9B9296] focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12 ${
                          fieldErrors.confirmPassword
                            ? "border-[#C64040]"
                            : "border-[#E9E2E5]"
                        }`}
                      />
                      {fieldErrors.confirmPassword ? (
                        <p className="mt-2 text-sm font-semibold text-[#C64040]">
                          {fieldErrors.confirmPassword}
                        </p>
                      ) : null}
                    </label>
                  ) : null}

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
                    {content.action}
                  </Button>
                  {googleClientId ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#E9E2E5]" />
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#9B9296]">
                          hoặc
                        </span>
                        <span className="h-px flex-1 bg-[#E9E2E5]" />
                      </div>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="google"
                          size="google"
                          onClick={handleGoogleFallbackClick}
                          disabled={isSubmitting}
                          aria-label={
                            mode === "login"
                              ? "Đăng nhập bằng Google"
                              : "Đăng ký bằng Google"
                          }
                          className="group relative overflow-hidden"
                        >
                          <GoogleIcon className="relative size-5" />
                          <span className="relative">
                            {mode === "login"
                              ? "Đăng nhập bằng Google"
                              : "Đăng ký bằng Google"}
                          </span>
                        </Button>
                        <div
                          ref={googleButtonRef}
                          aria-hidden="true"
                          className={`absolute inset-0 z-10 overflow-hidden opacity-0 [&>div]:h-12! [&>div]:w-full! ${
                            isGoogleButtonRendered
                              ? "pointer-events-auto"
                              : "pointer-events-none"
                          }`}
                        />
                      </div>
                    </div>
                  ) : null}
                </form>
              ) : (
                <form className="mt-7 space-y-4" onSubmit={handleVerifyOtp}>
                  <div className="rounded-lg border border-[#E9E2E5] bg-[#FFF3F6] p-4">
                    <p className="text-sm font-bold text-[#7A2944]">
                      {message}
                    </p>
                    {devOtp ? (
                      <p className="mt-2 text-sm font-extrabold text-[#1C1A1B]">
                        Mã OTP phát triển: {devOtp}
                      </p>
                    ) : null}
                  </div>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#1C1A1B]">
                      <LockKeyhole className="size-4 text-[#D96C8A]" />
                      Mã OTP
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            otpInputRefs.current[index] = element;
                          }}
                          value={digit}
                          inputMode="numeric"
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          maxLength={1}
                          aria-label={`Số OTP thứ ${index + 1}`}
                          aria-invalid={Boolean(fieldErrors.code)}
                          onChange={(event) =>
                            handleOtpChange(index, event.target.value)
                          }
                          onKeyDown={(event) => handleOtpKeyDown(index, event)}
                          onPaste={(event) => handleOtpPaste(index, event)}
                          className={`aspect-square min-h-11 rounded-md border bg-[#FFFCFA] text-center text-xl font-extrabold text-[#1C1A1B] outline-none transition focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/12 sm:min-h-12 ${
                            fieldErrors.code
                              ? "border-[#C64040]"
                              : "border-[#E9E2E5]"
                          }`}
                        />
                      ))}
                    </div>
                    {fieldErrors.code ? (
                      <p className="mt-2 text-sm font-semibold text-[#C64040]">
                        {fieldErrors.code}
                      </p>
                    ) : null}
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
                    {otpAction}
                  </Button>
                  <Button
                    type="button"
                    variant="linkBrand"
                    onClick={() => {
                      setStep("phone");
                      setOtpDigits(createEmptyOtp());
                      setOtpPurpose("REGISTER");
                      setError("");
                      setMessage("");
                    }}
                    className="mx-auto flex text-sm"
                  >
                    Đổi email
                  </Button>
                </form>
              )}

              {error ? (
                <p className="mt-4 rounded-md border border-[#C64040]/20 bg-[#C64040]/8 px-4 py-3 text-sm font-bold text-[#C64040]">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
