"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  ShieldCheck,
  Tag,
  LoaderCircle,
  X,
} from "lucide-react";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import { Button } from "@/components/ui/button";
import { Input as AccountInput } from "@/components/ui/input";
import CouponSelector from "@/components/Storefront/CouponSelector";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import type { CustomSelectProps } from "@/interface/Field";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";

const money = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;

type Item = {
  variantId: number;
  quantity: number;
  title: string;
  price: number;
  imageUrl: string;
  variantLabel: string;
  available: number;
  sku?: string | null;
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
  latitude: number | string | null;
  longitude: number | string | null;
  isDefaultShipping: boolean;
};
type Preview = {
  subtotal: number;
  membershipDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  payableTotal: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
  shipping: {
    available: boolean;
    estimatedDistanceKm?: number;
    estimatedDeliveryText?: string;
    unavailableReason?: string;
    roundedDistanceKm?: number;
    discountPercent?: number;
    chargeableDistanceKm?: number;
    shippingFeeBeforePromotion?: number;
    shippingDiscount?: number;
    baseFee?: number;
    distanceFee?: number;
  };
};
type PaymentSettings = {
  onlinePaymentEnabled: boolean;
  vietQrBankCode?: string;
  vietQrAccountNumber?: string;
  vietQrAccountName?: string;
  vietQrTemplate?: string;
};
type AdministrativeProvince = {
  code: number;
  name: string;
  wards: { code: number; name: string; province_code: number }[];
};
const emptyAddress = {
  fullName: "",
  phone: "",
  city: "",
  district: "",
  ward: "",
  line1: "",
  line2: "",
  latitude: "",
  longitude: "",
  isDefaultShipping: false,
};
const addressSchema = Yup.object({
  fullName: Yup.string().trim().required("Vui lòng nhập tên người nhận."),
  phone: Yup.string()
    .matches(/^0\d{9,10}$/, "Số điện thoại không hợp lệ.")
    .required("Vui lòng nhập số điện thoại."),
  city: Yup.string().trim().required("Vui lòng nhập tỉnh/thành phố."),
  line1: Yup.string().trim().required("Vui lòng nhập địa chỉ cụ thể."),
});

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`h-11 rounded-xl border border-[#EAE1E4] bg-white px-3 text-base outline-none focus:border-[#D96C8A] ${props.className || ""}`}
  />
);
const addressInputClass =
  "h-11! rounded-lg! border-[#E5E1E4]! bg-white! px-3! py-0! text-sm! font-medium! text-[#3B2D32]! shadow-none! outline-none! placeholder:text-[#A99BA0]! focus:border-[#D96C8A]! focus:ring-2! focus:ring-[#D96C8A]/15!";
const addressErrorClass = "text-red-1";
const addressErrorBorderClass = "border-red-1!";
function AccountAddressSelect({
  name,
  value,
  options,
  placeholder,
  disabled,
  onChange,
  hasError = false,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  hasError?: boolean;
}) {
  const formik = useFormik({
    initialValues: { selection: value },
    enableReinitialize: true,
    onSubmit: () => undefined,
  });
  return (
    <FormikProvider value={formik}>
      <AutoCompleteField<CustomSelectProps>
        component={CustomSelect}
        version="field"
        name="selection"
        searchable
        fullWidth
        placeholder={placeholder}
        optionValue={options}
        inputClassName={`${addressInputClass} ${hasError ? addressErrorBorderClass : ""}`}
        className={`h-11! w-full! min-w-0! rounded-xl! ${hasError ? addressErrorBorderClass : ""}`}
        disabled={disabled}
        onManualSelect={(selected) => onChange(selected || "")}
      />
    </FormikProvider>
  );
}

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing } = useAuth();
  const token = searchParams.get("session") || searchParams.get("intent") || "";
  const [items, setItems] = useState<Item[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editing, setEditing] = useState<number | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [provinces, setProvinces] = useState<AdministrativeProvince[]>([]);
  const [addressError, setAddressError] = useState("");
  const [addressesOpen, setAddressesOpen] = useState(false);
  const [addressRevision, setAddressRevision] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const skipCouponPreviewRef = useRef(false);
  const previewAbortRef = useRef<AbortController | null>(null);
  const couponTriggerRef = useRef<HTMLButtonElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER">("COD");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ onlinePaymentEnabled: false });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const addressFormik = useFormik({
    initialValues: addressForm,
    enableReinitialize: true,
    validationSchema: addressSchema,
    onSubmit: async (values) => {
      setAddressError("");
      setSaving(true);
      const response = await fetch(
        editing ? `/api/me/addresses/${editing}` : "/api/me/addresses",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const data = await response.json().catch(() => ({}));
      setSaving(false);
      if (!response.ok) {
        setAddressError(data.message || "Không thể lưu địa chỉ.");
        return;
      }
      setAddresses((current) =>
        editing
          ? current.map((item) => (item.id === editing ? data : item))
          : [...current, data],
      );
      setSelectedId(data.id);
      setAddressRevision((revision) => revision + 1);
      setAddressOpen(false);
      setEditing(null);
      setAddressError("");
    },
  });

  useEffect(() => {
    if (!addressOpen || provinces.length) return;
    fetch("/api/locations/administrative")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: AdministrativeProvince[]) => setProvinces(data))
      .catch(() =>
        setAddressError(
          "Không thể tải danh sách tỉnh thành. Bạn vẫn có thể nhập thủ công.",
        ),
      );
  }, [addressOpen, provinces.length]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [isAuthenticated, isInitializing, router]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Bạn chưa chọn sản phẩm để thanh toán.");
      return;
    }
    setError("");
    const load = async () => {
      const [first, addressResponse, paymentResponse] = await Promise.all([
        fetch(`/api/checkout/cart-intent?token=${encodeURIComponent(token)}`),
        fetch("/api/me/addresses"),
        fetch(`/api/payment-settings?t=${Date.now()}`, { cache: "no-store" }),
      ]);
      let checkout;
      if (first.ok) checkout = await first.json();
      else {
        const buy = await fetch(
          `/api/checkout/buy-now-intent?token=${encodeURIComponent(token)}`,
        );
        const data = await buy.json();
        if (!buy.ok)
          throw new Error(data.message || "Phiên thanh toán đã hết hạn.");
        checkout = {
          items: [
            {
              variantId: data.variantId,
              quantity: data.quantity,
              title: data.title,
              price: data.price,
              imageUrl: data.imageUrl,
              variantLabel: data.variantLabel,
              available: data.available,
            },
          ],
        };
      }
      setItems(checkout.items || []);
      setError("");
      if (addressResponse.ok) {
        const list = (await addressResponse.json()) as Address[];
        setAddresses(list);
        setSelectedId(
          (list.find((item) => item.isDefaultShipping) || list[0])?.id || null,
        );
      }
      if (paymentResponse.ok) {
        const paymentData = (await paymentResponse.json()) as PaymentSettings;
        setPaymentSettings(paymentData);
        if (!paymentData.onlinePaymentEnabled) setPaymentMethod("COD");
      }
    };
    void load()
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Không thể tải thông tin thanh toán.",
        ),
      )
      .finally(() => setLoading(false));
  }, [token]);

  const selected = addresses.find((item) => item.id === selectedId) || null;
  const selectedProvince = provinces.find(
    (item) => item.name === addressFormik.values.city,
  );
  const receiver = selected
    ? {
        receiverName: selected.fullName,
        receiverPhone: selected.phone,
        receiverAddress: [
          selected.line1,
          selected.ward,
          selected.district,
          selected.city,
        ]
          .filter(Boolean)
          .join(", "),
      }
    : { receiverName: "", receiverPhone: "", receiverAddress: "" };

  useEffect(() => {
    previewAbortRef.current?.abort();
    previewAbortRef.current = null;
    if (skipCouponPreviewRef.current) {
      skipCouponPreviewRef.current = false;
      return;
    }
    setError("");
    if (
      !items.length ||
      !selectedId
    ) {
      setPreview(null);
      setPreviewLoading(Boolean(items.length && selectedId));
      return;
    }
    setPreviewLoading(true);
    let controller: AbortController | null = null;
    const timer = window.setTimeout(() => {
      const requestController = new AbortController();
      controller = requestController;
      previewAbortRef.current = requestController;
      fetch("/api/checkout/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: requestController.signal,
        body: JSON.stringify({
          intent: token,
          addressId: selectedId,
          couponCode: appliedCoupon,
        }),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          setPreview(data);
        })
        .catch((cause) => {
          if (cause instanceof DOMException && cause.name === "AbortError")
            return;
          setError(
            cause instanceof Error
              ? cause.message
              : "Chưa thể tính phí giao hàng.",
          );
        })
        .finally(() => {
          if (previewAbortRef.current === controller) {
            previewAbortRef.current = null;
            setPreviewLoading(false);
          }
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller?.abort();
    };
  }, [
    appliedCoupon,
    items.length,
    selectedId,
    token,
    addressRevision,
  ]);

  const applyCoupon = async (code: string) => {
    setPreviewLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: token,
          addressId: selectedId,
          couponCode: code,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Mã giảm giá không hợp lệ.");
      skipCouponPreviewRef.current = true;
      setAppliedCoupon(code);
      setPreview(data);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Mã giảm giá không hợp lệ.",
      );
      return false;
    } finally {
      setPreviewLoading(false);
    }
  };

  const submit = async () => {
    if (
      !receiver.receiverName ||
      !receiver.receiverPhone ||
      !receiver.receiverAddress ||
      !selectedId
    )
      return setError("Vui lòng chọn hoặc nhập địa chỉ giao hàng hợp lệ.");
    if (!preview?.shipping.available || previewLoading)
      return setError("Chưa thể tính phí giao hàng. Vui lòng thử lại.");
    if (paymentMethod === "BANK_TRANSFER" && !paymentSettings.onlinePaymentEnabled)
      return setError("Thanh toán VietQR hiện đang tạm đóng.");
    setBusy(true);
    const response = await fetch("/api/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: token,
        addressId: selectedId || undefined,
        ...receiver,
        paymentMethod,
        couponCode: appliedCoupon,
        note: orderNote.trim() || undefined,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok)
      return setError(data.message || "Không thể tạo đơn hàng.");
    window.location.assign(
      `/checkout/success?order=${encodeURIComponent(data.orderNumber)}&payment=${encodeURIComponent(paymentMethod)}`,
    );
  };
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const summary = preview || {
    subtotal,
    membershipDiscount: 0,
    couponDiscount: 0,
    shippingFee: 0,
    payableTotal: subtotal,
    shipping: { available: true },
  };
  if (loading)
    return (
      <StorefrontShell>
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="storefront-skeleton h-8 w-40" />
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="storefront-skeleton h-48 rounded-2xl" />
              <div className="storefront-skeleton h-64 rounded-2xl" />
            </div>
            <div className="storefront-skeleton h-72 rounded-2xl" />
          </div>
        </main>
      </StorefrontShell>
    );
  return (
    <StorefrontShell>
      <main className="pb-32">
        <header className="border-b border-[#EAE1E4] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#A43E5F]"
            >
              <ArrowLeft className="size-4" /> Quay lại giỏ hàng
            </Link>
            <span className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="size-4 text-[#3F8F6B]" /> Thanh toán an
              toàn
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold">Thanh toán</h1>
          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-[#FFF1F3] px-4 py-3 text-sm font-semibold text-[#C94F62]"
            >
              {error}
            </p>
          ) : null}
          {!items.length ? (
            <div className="mt-10 rounded-2xl border border-[#EAE1E4] bg-white p-10 text-center">
              <p className="font-bold">Bạn chưa chọn sản phẩm để thanh toán</p>
              <Link
                href="/cart"
                className="mt-5 inline-flex rounded-xl bg-[#D96C8A] px-5 py-3 text-sm font-bold text-white"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-extrabold">
                      Địa chỉ giao hàng
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setAddressForm(emptyAddress);
                        setAddressError("");
                        setAddressOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#A43E5F]"
                    >
                      <Plus className="size-4" /> Thêm địa chỉ
                    </button>
                  </div>
                  {addresses.length ? (
                    <div className="mt-4 grid gap-3">
                      {(addressesOpen
                        ? addresses
                        : addresses.filter(
                            (address) =>
                              address.id === (selectedId || addresses[0]?.id),
                          )
                      ).map((address) => (
                        <div
                          key={address.id}
                          className={`relative rounded-xl border p-4 ${selectedId === address.id ? "border-[#D96C8A] bg-[#FFF8FA]" : "border-[#EAE1E4]"}`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(address.id)}
                            className="flex w-full gap-3 text-left"
                          >
                            <span
                              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${selectedId === address.id ? "border-[#D96C8A] bg-[#D96C8A] text-white" : "border-[#CDBFC4]"}`}
                            >
                              {selectedId === address.id ? (
                                <Check className="size-3" />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1 pr-20">
                              <strong className="block text-sm">
                                {address.fullName} · {address.phone}
                              </strong>
                              <span className="mt-1 block text-sm text-[#6F6066]">
                                {[
                                  address.line1,
                                  address.ward,
                                  address.district,
                                  address.city,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                              {address.isDefaultShipping ? (
                                <small className="absolute right-4 top-4 inline-flex rounded-full bg-[#FCEEF3] px-2 py-1 font-bold text-[#A43E5F]">
                                  Mặc định
                                </small>
                              ) : null}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(address.id);
                              setAddressForm({
                                ...emptyAddress,
                                fullName: address.fullName,
                                phone: address.phone,
                                city: address.city,
                                district: address.district || "",
                                ward: address.ward || "",
                                line1: address.line1,
                                latitude: String(address.latitude || ""),
                                longitude: String(address.longitude || ""),
                                isDefaultShipping: address.isDefaultShipping,
                              });
                              setAddressError("");
                              setAddressOpen(true);
                            }}
                            className="ml-8 mt-2 text-xs font-bold text-[#A43E5F]"
                          >
                            Chỉnh sửa
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#6F6066]">
                      Chưa có địa chỉ đã lưu. Hãy bấm “Thêm địa chỉ” để nhập địa
                      chỉ giao hàng.
                    </p>
                  )}
                  {addresses.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setAddressesOpen((value) => !value)}
                      className="mt-3 flex w-full items-center justify-center gap-1 border-t border-[#EAE1E4] pt-3 text-sm font-bold text-[#A43E5F]"
                      aria-expanded={addressesOpen}
                    >
                      {addressesOpen
                        ? "Thu gọn danh sách"
                        : `Xem ${addresses.length - 1} địa chỉ khác`}
                      <ChevronDown
                        className={`size-4 transition-transform ${addressesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : null}
              </section>
              <section className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
                <h2 className="text-lg font-extrabold">Ghi chú đơn hàng</h2>
                <textarea
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  maxLength={500}
                  className="mt-4 min-h-24 w-full rounded-xl border border-[#EAE1E4] p-3 text-sm outline-none focus:border-[#D96C8A]"
                />
              </section>
              <section className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
                  <h2 className="text-lg font-extrabold">Sản phẩm đặt mua</h2>
                  <div className="mt-4 divide-y divide-[#EAE1E4]">
                    {items.map((item) => (
                      <div
                        key={item.variantId}
                        className="flex gap-3 py-4 first:pt-0"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="size-16 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-bold">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-[#6F6066]">
                            {item.variantLabel || "Biến thể"} · SL{" "}
                            {item.quantity}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#A43E5F]">
                            {money(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <button
                  ref={couponTriggerRef}
                  type="button"
                  onClick={() => setCouponOpen(true)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A] ${appliedCoupon ? "border-[#F3C8D5] bg-[#FFF8FA]" : "border-[#EAE1E4] bg-white hover:border-[#D96C8A]"}`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FCEEF3] text-[#D96C8A]">
                    <Tag className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-extrabold">
                      Mã giảm giá
                    </strong>
                    <span className="mt-1 block truncate text-sm text-[#6F6066]">
                      {appliedCoupon
                        ? `${appliedCoupon} · Đã giảm ${money(preview?.couponDiscount || 0)}`
                        : "Chọn hoặc nhập mã giảm giá"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-[#A43E5F]">
                    {appliedCoupon ? "Thay đổi" : "Chọn mã"}
                    <ChevronRight className="size-4" />
                  </span>
                </button>
                {error && appliedCoupon && error.includes("mã") ? (
                  <p
                    role="alert"
                    className="mt-2 text-sm font-semibold text-[#C94F62]"
                  >
                    {error}
                  </p>
                ) : null}
                <section className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
                  <h2 className="text-lg font-extrabold">
                    Phương thức thanh toán
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["COD", "Thanh toán khi nhận hàng", "Thanh toán cho nhân viên giao hàng."],
                        ...(paymentSettings.onlinePaymentEnabled
                          ? [["BANK_TRANSFER", "Thanh toán online bằng VietQR", "Quét mã VietQR sau khi đặt hàng."]]
                          : []),
                      ] as const
                    ).map(([value, title, description]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setPaymentMethod(value as "COD" | "BANK_TRANSFER")}
                        className={`rounded-xl border p-4 text-left ${paymentMethod === value ? "border-[#D96C8A] bg-[#FFF8FA]" : "border-[#EAE1E4]"}`}
                      >
                        <strong className="block text-sm">{title}</strong>
                        <span className="mt-1 block text-xs text-[#6F6066]">
                          {description}
                        </span>
                      </button>
                    ))}
                  </div>
                  {paymentMethod === "BANK_TRANSFER" ? (
                    <p className="mt-4 rounded-xl bg-[#FFF8FA] p-4 text-sm leading-6 text-[#6F6066]">
                      Sau khi đặt hàng, bạn sẽ nhận được mã VietQR có nội dung chuyển khoản theo đúng mã đơn.
                    </p>
                  ) : null}
                </section>
              </div>
              <aside className="h-fit rounded-2xl border border-[#EAE1E4] bg-white p-5 lg:sticky lg:top-24">
                <h2 className="text-lg font-extrabold">Thông tin thanh toán</h2>
                <dl className="mt-5 space-y-3 text-sm text-[#6F6066]">
                  <div className="flex justify-between">
                    <dt>Tạm tính</dt>
                    <dd className="font-bold text-[#2D2226]">
                      {money(summary.subtotal)}
                    </dd>
                  </div>
                  {summary.membershipDiscount ? (
                    <div className="flex justify-between">
                      <dt>Ưu đãi thành viên</dt>
                      <dd className="font-bold text-[#3F8F6B]">
                        -{money(summary.membershipDiscount)}
                      </dd>
                    </div>
                  ) : null}
                  {summary.couponDiscount ? (
                    <div className="flex justify-between">
                      <dt>Mã giảm giá</dt>
                      <dd className="font-bold text-[#3F8F6B]">
                        -{money(summary.couponDiscount)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt>Phí giao hàng</dt>
                    <dd className="font-bold text-[#2D2226]">
                      {summary.shippingFee
                        ? money(summary.shippingFee)
                        : "Miễn phí"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex justify-between border-t border-[#EAE1E4] pt-4">
                  <span className="font-bold">Tổng thanh toán</span>
                  <strong className="text-xl text-[#A43E5F]">
                    {money(summary.payableTotal)}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={
                    busy || previewLoading
                  }
                  className="mt-5 hidden h-12 w-full rounded-xl bg-[#D96C8A] text-sm font-bold text-white disabled:opacity-50 lg:block"
                >
                  {busy ? "Đang tạo đơn hàng..." : "Đặt hàng"}
                </button>
                <p className="mt-4 text-xs leading-5 text-[#998B91]">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <Link
                    href="/policies?policy=terms"
                    className="font-bold text-[#A43E5F]"
                  >
                    chính sách mua hàng
                  </Link>
                  .
                </p>
              </aside>
            </div>
          )}
        </div>
        {items.length ? (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EAE1E4] bg-white/95 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#998B91]">Tổng thanh toán</p>
                <p className="truncate text-base font-extrabold text-[#A43E5F]">
                  {money(summary.payableTotal)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={
                  busy || previewLoading
                }
                className="h-11 rounded-xl bg-[#D96C8A] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Đang đặt..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        ) : null}
        <CouponSelector
          open={couponOpen}
          onOpenChange={setCouponOpen}
          intent={token}
          selectedCode={appliedCoupon}
          onApply={applyCoupon}
          triggerRef={couponTriggerRef}
        />
        {addressOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2D2226]/35 sm:items-center sm:p-4">
            <form
              onSubmit={addressFormik.handleSubmit}
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl sm:p-8"
            >
              <div className="flex justify-between">
                <h2 className="text-lg font-extrabold">
                  {editing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
                </h2>
                <button
                  type="button"
                  onClick={() => setAddressOpen(false)}
                  aria-label="Đóng"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-6 grid items-start gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Tên người nhận
                  <AccountInput
                    variant="border"
                    name="fullName"
                    value={addressFormik.values.fullName}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    aria-invalid={Boolean(
                      addressFormik.touched.fullName &&
                      addressFormik.errors.fullName,
                    )}
                    placeholder="Nhập họ và tên người nhận"
                    className={`${addressInputClass} ${addressFormik.touched.fullName && addressFormik.errors.fullName ? addressErrorBorderClass : ""}`}
                  />
                  {addressFormik.touched.fullName &&
                  addressFormik.errors.fullName ? (
                    <span
                      className={`text-xs font-medium ${addressErrorClass}`}
                    >
                      {addressFormik.errors.fullName}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Số điện thoại
                  <AccountInput
                    variant="border"
                    name="phone"
                    inputMode="tel"
                    value={addressFormik.values.phone}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    aria-invalid={Boolean(
                      addressFormik.touched.phone && addressFormik.errors.phone,
                    )}
                    placeholder="Nhập số điện thoại"
                    className={`${addressInputClass} ${addressFormik.touched.phone && addressFormik.errors.phone ? addressErrorBorderClass : ""}`}
                  />
                  {addressFormik.touched.phone && addressFormik.errors.phone ? (
                    <span
                      className={`text-xs font-medium ${addressErrorClass}`}
                    >
                      {addressFormik.errors.phone}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Tỉnh/Thành phố
                  <AccountAddressSelect
                    name="city"
                    value={addressFormik.values.city}
                    placeholder="Tìm tỉnh/thành phố"
                    options={provinces.map((province) => ({
                      value: province.name,
                      label: province.name,
                    }))}
                    hasError={Boolean(
                      addressFormik.touched.city && addressFormik.errors.city,
                    )}
                    onChange={(city) =>
                      addressFormik.setValues({
                        ...addressFormik.values,
                        city,
                        district: "",
                        ward: "",
                        latitude: "",
                        longitude: "",
                      })
                    }
                  />
                  {addressFormik.touched.city && addressFormik.errors.city ? (
                    <span
                      className={`text-xs font-medium ${addressErrorClass}`}
                    >
                      {addressFormik.errors.city}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Phường/Xã
                  <AccountAddressSelect
                    name="ward"
                    value={addressFormik.values.ward}
                    placeholder="Tìm phường/xã"
                    disabled={!selectedProvince}
                    options={
                      selectedProvince?.wards.map((ward) => ({
                        value: ward.name,
                        label: ward.name,
                      })) || []
                    }
                    onChange={(ward) =>
                      addressFormik.setValues({
                        ...addressFormik.values,
                        ward,
                        latitude: "",
                        longitude: "",
                      })
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold sm:col-span-2">
                  Địa chỉ cụ thể
                  <AccountInput
                    variant="border"
                    name="line1"
                    value={addressFormik.values.line1}
                    onChange={(event) =>
                      addressFormik.setValues({
                        ...addressFormik.values,
                        line1: event.target.value,
                        latitude: "",
                        longitude: "",
                      })
                    }
                    onBlur={addressFormik.handleBlur}
                    aria-invalid={Boolean(
                      addressFormik.touched.line1 && addressFormik.errors.line1,
                    )}
                    placeholder="Số nhà, tên đường"
                    className={`${addressInputClass} ${addressFormik.touched.line1 && addressFormik.errors.line1 ? addressErrorBorderClass : ""}`}
                  />
                  {addressFormik.touched.line1 && addressFormik.errors.line1 ? (
                    <span
                      className={`text-xs font-medium ${addressErrorClass}`}
                    >
                      {addressFormik.errors.line1}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-2 text-sm font-bold sm:col-span-2">
                  Ghi chú
                  <AccountInput
                    variant="border"
                    name="line2"
                    value={addressFormik.values.line2}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao"
                    className={addressInputClass}
                  />
                </label>
              </div>
              <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={addressFormik.values.isDefaultShipping}
                  onChange={addressFormik.handleChange}
                  name="isDefaultShipping"
                  disabled={!addresses.length}
                  className="size-4 accent-[#D96C8A]"
                />
                {!addresses.length
                  ? "Địa chỉ duy nhất luôn là mặc định"
                  : "Đặt làm địa chỉ mặc định"}
              </label>
              {addressError ? (
                <p
                  role="alert"
                  className="mt-4 text-sm font-semibold text-red-1"
                >
                  {addressError}
                </p>
              ) : null}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddressOpen(false)}
                  disabled={saving}
                  className="h-11"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={saving}
                  className="h-11 gap-2"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : null}
                  Lưu địa chỉ
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </StorefrontShell>
  );
}
