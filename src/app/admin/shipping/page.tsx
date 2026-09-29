"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { Field, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import {
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hook/use-toast";
import { AuthDatePicker } from "@/components/Auth/AuthPageClient";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import type { CustomSelectProps } from "@/interface/Field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdministrativeProvince = {
  code: number;
  name: string;
  wards: { code: number; name: string; province_code: number }[];
};

type Config = {
  enabled: boolean;
  shopName: string;
  formattedAddress: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string;
  baseFee: number;
  pricePerKm: number;
  maximumDeliveryDistanceKm: number;
  distanceRoundingMode: string;
  feeRoundingStep: number;
  minimumShippingFee: number | null;
  maximumShippingFee: number | null;
  fallbackShippingFee: number;
};
type Promotion = {
  id: number;
  name: string;
  description?: string | null;
  minimumOrderValue: number;
  discountPercent: number;
  maximumShippingDiscount?: number | null;
  priority: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};
type PromotionForm = {
  name: string;
  description: string;
  minimumOrderValue: string;
  discountPercent: string;
  maximumShippingDiscount: string;
  priority: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};
const emptyConfig: Config = {
  enabled: true,
  shopName: "",
  formattedAddress: "",
  streetAddress: "",
  ward: "",
  district: "",
  province: "",
  latitude: null,
  longitude: null,
  placeId: "",
  baseFee: 10000,
  pricePerKm: 5000,
  maximumDeliveryDistanceKm: 30,
  distanceRoundingMode: "UP_TO_0_5_KM",
  feeRoundingStep: 1000,
  minimumShippingFee: null,
  maximumShippingFee: null,
  fallbackShippingFee: 30000,
};
const emptyPromotion: PromotionForm = {
  name: "",
  description: "",
  minimumOrderValue: "",
  discountPercent: "",
  maximumShippingDiscount: "",
  priority: "0",
  isActive: true,
  startsAt: "",
  endsAt: "",
};
const control =
  "h-10! rounded-lg! border-(--admin-border)! bg-white! px-3! text-sm! text-(--admin-text)! outline-none! focus:border-(--admin-primary)! focus:ring-2! focus:ring-(--admin-primary)/10!";
const money = (value: number) =>
  `${Math.round(value).toLocaleString("vi-VN")}đ`;
const datePickerValue = (value: string) => (value ? value.slice(0, 10) : "");
const configSchema = Yup.object({
  shopName: Yup.string().trim().required("Vui lòng nhập tên cửa hàng."),
  formattedAddress: Yup.string()
    .trim()
    .required("Vui lòng nhập địa chỉ cửa hàng."),
  province: Yup.string().trim().required("Vui lòng chọn tỉnh/thành phố."),
  ward: Yup.string().trim().required("Vui lòng chọn phường/xã."),
  latitude: Yup.number()
    .nullable()
    .required("Vui lòng chọn địa chỉ để lấy tọa độ."),
  longitude: Yup.number()
    .nullable()
    .required("Vui lòng chọn địa chỉ để lấy tọa độ."),
  baseFee: Yup.number().min(0, "Phí cơ bản không hợp lệ."),
  pricePerKm: Yup.number().min(0, "Đơn giá không hợp lệ."),
  fallbackShippingFee: Yup.number().min(0, "Phí dự phòng không hợp lệ."),
  maximumDeliveryDistanceKm: Yup.number().moreThan(
    0,
    "Khoảng cách tối đa phải lớn hơn 0.",
  ),
  feeRoundingStep: Yup.number().moreThan(0, "Bước làm tròn phải lớn hơn 0."),
});
const promotionSchema = Yup.object({
  name: Yup.string().trim().required("Vui lòng nhập tên chương trình."),
  minimumOrderValue: Yup.number()
    .typeError("Vui lòng nhập giá trị đơn tối thiểu.")
    .min(0, "Giá trị đơn tối thiểu không hợp lệ.")
    .required("Vui lòng nhập giá trị đơn tối thiểu."),
  discountPercent: Yup.number()
    .typeError("Vui lòng nhập phần trăm miễn phí vận chuyển.")
    .moreThan(0, "Phần trăm miễn phí vận chuyển phải lớn hơn 0.")
    .max(100, "Phần trăm miễn phí vận chuyển không được vượt quá 100%.")
    .required("Vui lòng nhập phần trăm miễn phí vận chuyển."),
  maximumShippingDiscount: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .moreThan(0, "Mức giảm tối đa phải lớn hơn 0."),
  priority: Yup.number()
    .typeError("Độ ưu tiên không hợp lệ.")
    .min(0, "Độ ưu tiên không được âm."),
  startsAt: Yup.string().nullable(),
  endsAt: Yup.string()
    .nullable()
    .test(
      "after-start",
      "Thời gian kết thúc phải sau thời gian bắt đầu.",
      function (value) {
        const startsAt = this.parent.startsAt;
        return !value || !startsAt || new Date(value) > new Date(startsAt);
      },
    ),
});

export default function ShippingPage() {
  const [config, setConfig] = useState<Config>(emptyConfig);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [provinces, setProvinces] = useState<AdministrativeProvince[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [configResponse, promotionsResponse] = await Promise.all([
      fetch("/api/admin/shipping/configuration"),
      fetch("/api/admin/shipping/promotions"),
    ]);
    if (configResponse.ok)
      setConfig({ ...emptyConfig, ...(await configResponse.json()) });
    if (promotionsResponse.ok) setPromotions(await promotionsResponse.json());
  };
  useEffect(() => {
    void load();
    fetch("/api/locations/administrative")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => setProvinces([]));
  }, []);
  const configFormik = useFormik<Config>({
    initialValues: config,
    enableReinitialize: true,
    validationSchema: configSchema,
    onSubmit: async (values) => {
      setSaving(true);
      const response = await fetch("/api/admin/shipping/configuration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      setSaving(false);
      if (response.ok) {
        setConfig({ ...values, ...data });
        toast({
          title: "Đã lưu cấu hình vận chuyển.",
          description: "Cấu hình phí giao hàng đã được cập nhật.",
          className: "bg-green-16 text-white text-sm font-medium w-fit",
          duration: 2500,
        });
      } else {
        toast({
          title: "Không thể lưu cấu hình vận chuyển.",
          description: data.message || "Vui lòng kiểm tra lại thông tin.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
      }
    },
  });
  const selectedProvince = provinces.find(
    (item) => item.name === configFormik.values.province,
  );
  const provinceHasError = Boolean(
    configFormik.touched.province && configFormik.errors.province,
  );
  const wardHasError = Boolean(
    configFormik.touched.ward && configFormik.errors.ward,
  );
  const latitudeHasError = Boolean(
    configFormik.touched.latitude && configFormik.errors.latitude,
  );
  const longitudeHasError = Boolean(
    configFormik.touched.longitude && configFormik.errors.longitude,
  );
  const promotionFormik = useFormik<PromotionForm>({
    initialValues: emptyPromotion,
    enableReinitialize: true,
    validationSchema: promotionSchema,
    onSubmit: async (values) => {
      setSaving(true);
      const body = {
        ...values,
        minimumOrderValue: Number(values.minimumOrderValue),
        discountPercent: Number(values.discountPercent),
        maximumShippingDiscount:
          values.maximumShippingDiscount === ""
            ? null
            : Number(values.maximumShippingDiscount),
        priority: Number(values.priority),
      };
      const response = await fetch(
        editing
          ? `/api/admin/shipping/promotions/${editing}`
          : "/api/admin/shipping/promotions",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json().catch(() => ({}));
      setSaving(false);
      if (!response.ok) {
        toast({
          title: "Không thể lưu ưu đãi.",
          description: data.message || "Vui lòng kiểm tra lại thông tin.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return;
      }
      toast({
        title: editing ? "Đã cập nhật ưu đãi." : "Đã tạo ưu đãi.",
        className: "bg-green-16 text-white text-sm font-medium w-fit",
        duration: 2500,
      });
      setFormOpen(false);
      setEditing(null);
      promotionFormik.resetForm({ values: emptyPromotion });
      await load();
    },
  });
  const preview = useMemo(() => {
    const minimum = Number(promotionFormik.values.minimumOrderValue);
    const discountPercent = Number(promotionFormik.values.discountPercent);
    const maximumDiscount = Number(
      promotionFormik.values.maximumShippingDiscount,
    );
    if (
      !Number.isFinite(minimum) ||
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0
    )
      return null;
    const distance = 8;
    const beforePromotion = config.baseFee + distance * config.pricePerKm;
    const discount = Math.min(
      beforePromotion,
      (beforePromotion * Math.min(100, discountPercent)) / 100,
      Number.isFinite(maximumDiscount) && maximumDiscount > 0
        ? maximumDiscount
        : Number.POSITIVE_INFINITY,
    );
    return {
      distance,
      discountPercent,
      discount,
      fee: Math.max(0, beforePromotion - discount),
    };
  }, [
    config.baseFee,
    config.pricePerKm,
    promotionFormik.values.discountPercent,
    promotionFormik.values.maximumShippingDiscount,
    promotionFormik.values.minimumOrderValue,
  ]);
  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Cấu hình vận chuyển"
        description="Quản lý vị trí cửa hàng, phí giao hàng và ưu đãi theo giá trị đơn hàng."
      />
      <FormikProvider value={configFormik}>
        <form
          onSubmit={configFormik.handleSubmit}
          className="flex flex-col gap-6"
        >
          <AdminSection>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <MapPin className="size-4 text-primary" /> Địa chỉ cửa hàng
                </h2>
                <p className="mt-1 text-sm text-(--admin-text-secondary)">
                  Tọa độ này được dùng làm điểm xuất phát cho tuyến giao hàng.
                </p>
              </div>
              <Button
                type="submit"
                variant="brand"
                disabled={saving}
                className="h-10 gap-2"
              >
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span>Lưu cấu hình</span>
              </Button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                Địa chỉ cửa hàng
                <Input
                  className={`${control} ${configFormik.touched.formattedAddress && configFormik.errors.formattedAddress ? "border-red-500!" : ""}`}
                  name="formattedAddress"
                  value={configFormik.values.formattedAddress}
                  onChange={configFormik.handleChange}
                  onBlur={configFormik.handleBlur}
                  placeholder="Nhập địa chỉ cửa hàng"
                />
                {configFormik.touched.formattedAddress &&
                configFormik.errors.formattedAddress ? (
                  <span className="text-xs font-medium text-red-500">
                    {configFormik.errors.formattedAddress}
                  </span>
                ) : null}
              </label>
              <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                Tên cửa hàng
                <Input
                  className={`${control} ${configFormik.touched.shopName && configFormik.errors.shopName ? "border-red-500!" : ""}`}
                  name="shopName"
                  value={configFormik.values.shopName}
                  onChange={configFormik.handleChange}
                  onBlur={configFormik.handleBlur}
                  placeholder="Nhập tên cửa hàng"
                />
                {configFormik.touched.shopName &&
                configFormik.errors.shopName ? (
                  <span className="text-xs font-medium text-red-500">
                    {configFormik.errors.shopName}
                  </span>
                ) : null}
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Tỉnh/Thành phố
                <AutoCompleteField<CustomSelectProps>
                  component={CustomSelect}
                  version="field"
                  name="province"
                  searchable
                  fullWidth
                  placeholder="Tìm tỉnh/thành phố"
                  optionValue={provinces.map((province) => ({
                    value: province.name,
                    label: province.name,
                  }))}
                  inputClassName={`${control} ${provinceHasError ? "border-red-500!" : ""}`}
                  className={`h-10! w-full! min-w-0! rounded-lg! ${provinceHasError ? "border-red-500!" : ""}`}
                  errorClassName="text-red-500"
                  placeholderClassName="placeholder-green-1! text-green-1!"
                  onManualSelect={(value) =>
                    configFormik.setValues({
                      ...configFormik.values,
                      province: value || "",
                      ward: "",
                      latitude: null,
                      longitude: null,
                    })
                  }
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Phường/Xã
                <AutoCompleteField<CustomSelectProps>
                  component={CustomSelect}
                  version="field"
                  name="ward"
                  searchable
                  fullWidth
                  placeholder="Tìm phường/xã"
                  optionValue={
                    selectedProvince?.wards.map((ward) => ({
                      value: ward.name,
                      label: ward.name,
                    })) || []
                  }
                  inputClassName={`${control} ${wardHasError ? "border-red-500!" : ""}`}
                  className={`h-10! w-full! min-w-0! rounded-lg! ${wardHasError ? "border-red-500!" : ""}`}
                  errorClassName="text-red-500"
                  placeholderClassName="placeholder-green-1! text-green-1!"
                  disabled={!selectedProvince}
                  onManualSelect={(value) =>
                    configFormik.setValues({
                      ...configFormik.values,
                      ward: value || "",
                      latitude: null,
                      longitude: null,
                    })
                  }
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Vĩ độ
                <Input
                  className={`${control} ${latitudeHasError ? "border-red-500!" : ""}`}
                  type="number"
                  name="latitude"
                  value={configFormik.values.latitude ?? ""}
                  placeholder="Nhập vĩ độ"
                  onChange={(event) =>
                    configFormik.setFieldValue(
                      "latitude",
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                    )
                  }
                />
                {configFormik.touched.latitude &&
                configFormik.errors.latitude ? (
                  <span className="text-xs font-medium text-red-500">
                    {configFormik.errors.latitude}
                  </span>
                ) : null}
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Kinh độ
                <Input
                  className={`${control} ${longitudeHasError ? "border-red-500!" : ""}`}
                  type="number"
                  name="longitude"
                  value={configFormik.values.longitude ?? ""}
                  placeholder="Nhập kinh độ"
                  onChange={(event) =>
                    configFormik.setFieldValue(
                      "longitude",
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                    )
                  }
                />
                {configFormik.touched.longitude &&
                configFormik.errors.longitude ? (
                  <span className="text-xs font-medium text-red-500">
                    {configFormik.errors.longitude}
                  </span>
                ) : null}
              </label>
            </div>
          </AdminSection>
          <AdminSection>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Truck className="size-4 text-primary" /> Cấu hình phí giao
                  hàng
                </h2>
                <p className="mt-1 text-sm text-(--admin-text-secondary)">
                  Mọi giá trị tiền được lưu theo VND nguyên.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={configFormik.values.enabled}
                  onChange={(event) =>
                    configFormik.setFieldValue("enabled", event.target.checked)
                  }
                  className="size-4 accent-(--admin-primary)"
                />{" "}
                Bật tính phí
              </label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["baseFee", "Phí cơ bản"],
                  ["pricePerKm", "Đơn giá mỗi km"],
                  [
                    "fallbackShippingFee",
                    "Phí khi không tính được khoảng cách",
                  ],
                  ["maximumDeliveryDistanceKm", "Khoảng cách tối đa"],
                  ["feeRoundingStep", "Bước làm tròn phí"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="grid gap-1.5 text-sm font-medium">
                  {label}
                  <Field
                    component={NumericInput}
                    className={control}
                    min="0"
                    name={field}
                    variant="border"
                    inputMode="decimal"
                  />
                </label>
              ))}
              <label className="grid gap-1.5 text-sm font-medium">
                Làm tròn khoảng cách
                <Select
                  value={configFormik.values.distanceRoundingMode}
                  onValueChange={(value) =>
                    configFormik.setFieldValue("distanceRoundingMode", value)
                  }
                >
                  <SelectTrigger
                    className={control}
                    aria-label="Làm tròn khoảng cách"
                  >
                    <SelectValue placeholder="Chọn cách làm tròn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXACT">Chính xác</SelectItem>
                    <SelectItem value="UP_TO_0_5_KM">Lên 0,5 km</SelectItem>
                    <SelectItem value="UP_TO_1_KM">Lên 1 km</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
          </AdminSection>
        </form>
      </FormikProvider>
      <AdminSection>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Ưu đãi phí vận chuyển</h2>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              Chỉ một ưu đãi tốt nhất được áp dụng cho mỗi đơn.
            </p>
          </div>
          <Button
            type="button"
            variant="brand"
            onClick={() => {
              promotionFormik.resetForm({ values: emptyPromotion });
              setEditing(null);
              setFormOpen(true);
            }}
            className="h-10 gap-2"
          >
            <Plus className="size-4" /> Thêm ưu đãi
          </Button>
        </div>
        {formOpen ? (
          <FormikProvider value={promotionFormik}>
            <form
              onSubmit={promotionFormik.handleSubmit}
              className="mt-5 rounded-xl border border-(--admin-border) bg-(--admin-primary-soft) p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  {editing ? "Chỉnh sửa ưu đãi" : "Thêm ưu đãi vận chuyển"}
                </h3>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Đóng"
                ></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 items-start">
                {(
                  [
                    ["name", "Tên chương trình"],
                    ["minimumOrderValue", "Giá trị đơn tối thiểu"],
                    ["discountPercent", "Miễn phí vận chuyển (%)"],
                    ["maximumShippingDiscount", "Giảm tối đa (đ)"],
                    ["priority", "Độ ưu tiên"],
                    ["startsAt", "Thời gian bắt đầu"],
                    ["endsAt", "Thời gian kết thúc"],
                  ] as const
                ).map(([field, label]) => (
                  <label
                    key={field}
                    className="grid gap-1.5 text-sm font-medium"
                  >
                    {label}
                    {field.includes("At") ? (
                      <div className="relative">
                        <AuthDatePicker
                          value={datePickerValue(
                            field === "endsAt"
                              ? promotionFormik.values.endsAt
                              : promotionFormik.values.startsAt,
                          )}
                          allowFuture
                          minDate={
                            field === "endsAt"
                              ? datePickerValue(promotionFormik.values.startsAt)
                              : undefined
                          }
                          placeholder={
                            field === "startsAt"
                              ? "Chọn thời gian bắt đầu"
                              : "Chọn thời gian kết thúc"
                          }
                          hasError={Boolean(
                            promotionFormik.touched[field] &&
                            promotionFormik.errors[field],
                          )}
                          clearable
                          onClear={() => {
                            promotionFormik.setFieldValue(field, "");
                            promotionFormik.setFieldTouched(field, true, false);
                          }}
                          className={`${control} w-full! pr-10! ${promotionFormik.touched[field] && promotionFormik.errors[field] ? "border-red-500!" : ""}`}
                          onChange={(value) => {
                            promotionFormik.setFieldValue(field, value);
                            promotionFormik.setFieldTouched(field, true, false);
                          }}
                        />
                      </div>
                    ) : field === "minimumOrderValue" ||
                      field === "discountPercent" ||
                      field === "maximumShippingDiscount" ? (
                      <Field
                        component={NumericInput}
                        className={`${control} ${promotionFormik.touched[field] && promotionFormik.errors[field] ? "border-red-500!" : ""}`}
                        name={field}
                        variant="border"
                        inputMode="numeric"
                        hiddenErr
                        placeholder={
                          {
                            minimumOrderValue: "Nhập giá trị đơn tối thiểu",
                            discountPercent: "Nhập % miễn phí vận chuyển",
                            maximumShippingDiscount: "Nhập mức giảm tối đa",
                          }[field]
                        }
                      />
                    ) : (
                      <Input
                        className={`${control} ${promotionFormik.touched[field] && promotionFormik.errors[field] ? "border-red-500!" : ""}`}
                        name={field}
                        type={field === "name" ? "text" : "number"}
                        placeholder={
                          {
                            name: "Nhập tên chương trình",
                            priority: "Nhập độ ưu tiên",
                            minimumOrderValue: "",
                            discountPercent: "",
                            maximumShippingDiscount: "",
                            startsAt: "",
                            endsAt: "",
                          }[field]
                        }
                        value={promotionFormik.values[field]}
                        onChange={promotionFormik.handleChange}
                        onBlur={promotionFormik.handleBlur}
                      />
                    )}
                    {promotionFormik.touched[field] &&
                    promotionFormik.errors[field] ? (
                      <span className="text-xs font-medium text-red-500">
                        {promotionFormik.errors[field]}
                      </span>
                    ) : null}
                  </label>
                ))}
                <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                  Mô tả
                  <textarea
                    className="min-h-20 rounded-lg border border-(--admin-border) bg-white p-3 text-sm"
                    name="description"
                    placeholder="Nhập mô tả chương trình (không bắt buộc)"
                    value={promotionFormik.values.description}
                    onChange={promotionFormik.handleChange}
                    onBlur={promotionFormik.handleBlur}
                  />
                </label>
              </div>
              {preview ? (
                <p className="mt-4 rounded-lg bg-white p-3 text-sm text-(--admin-text-secondary)">
                  Ví dụ đơn 600.000đ, khoảng cách 8km: miễn phí{" "}
                  {preview.discountPercent}% ({money(preview.discount)}) · dự
                  kiến {money(preview.fee)}.
                </p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : null}
                  <span>Lưu ưu đãi</span>
                </Button>
              </div>
            </form>
          </FormikProvider>
        ) : null}
        <div className="mt-5 grid gap-3">
          {promotions.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--admin-border) bg-white p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-(--admin-text-secondary)">
                  Đơn từ {money(item.minimumOrderValue)} · Miễn phí{" "}
                  {item.discountPercent}% · Tối đa{" "}
                  {item.maximumShippingDiscount == null
                    ? "không giới hạn"
                    : money(item.maximumShippingDiscount)}{" "}
                  · Ưu tiên {item.priority}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-(--admin-primary-soft) text-primary" : "bg-slate-100 text-slate-500"}`}
                >
                  {item.isActive ? "Đang hoạt động" : "Tạm dừng"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setEditing(item.id);
                    promotionFormik.setValues({
                      ...item,
                      minimumOrderValue: String(item.minimumOrderValue),
                      discountPercent: String(item.discountPercent),
                      maximumShippingDiscount:
                        item.maximumShippingDiscount == null
                          ? ""
                          : String(item.maximumShippingDiscount),
                      priority: String(item.priority),
                      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
                      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
                    } as any);
                    setFormOpen(true);
                  }}
                  aria-label="Chỉnh sửa"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={async () => {
                    if (!window.confirm("Xóa ưu đãi này?")) return;
                    await fetch(`/api/admin/shipping/promotions/${item.id}`, {
                      method: "DELETE",
                    });
                    await load();
                  }}
                  aria-label="Xóa"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>
      <Toaster />
    </AdminPageContainer>
  );
}
