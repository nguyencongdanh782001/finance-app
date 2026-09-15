"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { MapPin, Pencil, Plus, Save, Trash2, Truck, X } from "lucide-react";
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
};
type Promotion = {
  id: number;
  name: string;
  description?: string | null;
  minimumOrderValue: number;
  freeDistanceKm: number;
  maximumShippingDiscount?: number | null;
  priority: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
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
};
const emptyPromotion = {
  name: "",
  description: "",
  minimumOrderValue: "",
  freeDistanceKm: "",
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

export default function ShippingPage() {
  const [config, setConfig] = useState<Config>(emptyConfig);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotion, setPromotion] = useState(emptyPromotion);
  const [editing, setEditing] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [addressSearch, setAddressSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [message, setMessage] = useState("");
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
  }, []);
  useEffect(() => {
    if (addressSearch.trim().length < 3) return setSuggestions([]);
    const timer = window.setTimeout(
      () =>
        fetch(
          `/api/locations/autocomplete?text=${encodeURIComponent(addressSearch)}`,
        )
          .then((response) =>
            response.ok ? response.json() : { suggestions: [] },
          )
          .then((data) => setSuggestions(data.suggestions || []))
          .catch(() => setSuggestions([])),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [addressSearch]);
  const saveConfig = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/shipping/configuration", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(
      response.ok
        ? "Đã lưu cấu hình vận chuyển."
        : data.message || "Không thể lưu cấu hình.",
    );
    if (response.ok) setConfig({ ...config, ...data });
  };
  const savePromotion = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const body = {
      ...promotion,
      minimumOrderValue: Number(promotion.minimumOrderValue),
      freeDistanceKm: Number(promotion.freeDistanceKm),
      maximumShippingDiscount:
        promotion.maximumShippingDiscount === ""
          ? null
          : Number(promotion.maximumShippingDiscount),
      priority: Number(promotion.priority),
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
    if (!response.ok)
      return setMessage(data.message || "Không thể lưu ưu đãi.");
    setMessage(editing ? "Đã cập nhật ưu đãi." : "Đã tạo ưu đãi.");
    setFormOpen(false);
    setEditing(null);
    setPromotion(emptyPromotion);
    await load();
  };
  const preview = useMemo(() => {
    const minimum = Number(promotion.minimumOrderValue);
    const free = Number(promotion.freeDistanceKm);
    if (!Number.isFinite(minimum) || !Number.isFinite(free) || free <= 0)
      return null;
    const distance = 8;
    const chargeable = Math.max(0, distance - free);
    return {
      distance,
      free,
      chargeable,
      fee:
        chargeable === 0 ? 0 : config.baseFee + chargeable * config.pricePerKm,
    };
  }, [
    config.baseFee,
    config.pricePerKm,
    promotion.freeDistanceKm,
    promotion.minimumOrderValue,
  ]);
  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Cấu hình vận chuyển"
        description="Quản lý vị trí cửa hàng, phí giao hàng và ưu đãi theo giá trị đơn hàng."
      />
      {message ? (
        <p
          role="status"
          className="rounded-xl border border-(--admin-border) bg-(--admin-primary-soft) px-4 py-3 text-sm font-semibold text-(--admin-primary)"
        >
          {message}
        </p>
      ) : null}
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
            type="button"
            variant="brand"
            onClick={() => void saveConfig()}
            disabled={saving}
            className="h-10 gap-2"
          >
            <Save className="size-4" /> Lưu cấu hình
          </Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
            Tìm địa chỉ cửa hàng
            <Input
              className={control}
              value={addressSearch}
              onChange={(event) => setAddressSearch(event.target.value)}
              placeholder="Nhập địa chỉ và chọn gợi ý"
            />
            {suggestions.length ? (
              <div className="grid gap-1 rounded-xl border border-(--admin-border) bg-white p-1 shadow-lg">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setConfig({
                        ...config,
                        formattedAddress: item.formattedAddress,
                        streetAddress: item.addressLine1 || "",
                        ward: item.ward || "",
                        district: item.district || "",
                        province: item.state || item.city || "",
                        latitude: item.latitude,
                        longitude: item.longitude,
                        placeId: item.id,
                      });
                      setAddressSearch(item.formattedAddress);
                      setSuggestions([]);
                    }}
                    className="rounded-lg p-2.5 text-left text-sm hover:bg-(--admin-primary-soft)"
                  >
                    {item.formattedAddress}
                  </button>
                ))}
              </div>
            ) : null}
          </label>
          {(
            [
              "shopName",
              "formattedAddress",
              "streetAddress",
              "ward",
              "district",
              "province",
            ] as const
          ).map((field) => (
            <label key={field} className="grid gap-1.5 text-sm font-medium">
              {
                (
                  {
                    shopName: "Tên cửa hàng",
                    formattedAddress: "Địa chỉ hiển thị",
                    streetAddress: "Địa chỉ đường",
                    ward: "Phường/Xã",
                    district: "Quận/Huyện",
                    province: "Tỉnh/Thành phố",
                  } as Record<string, string>
                )[field]
              }
              <Input
                className={control}
                value={config[field]}
                onChange={(event) =>
                  setConfig({ ...config, [field]: event.target.value })
                }
              />
            </label>
          ))}
          <label className="grid gap-1.5 text-sm font-medium">
            Vĩ độ
            <Input
              className={control}
              type="number"
              value={config.latitude ?? ""}
              onChange={(event) =>
                setConfig({
                  ...config,
                  latitude:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Kinh độ
            <Input
              className={control}
              type="number"
              value={config.longitude ?? ""}
              onChange={(event) =>
                setConfig({
                  ...config,
                  longitude:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                })
              }
            />
          </label>
        </div>
      </AdminSection>
      <AdminSection>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Truck className="size-4 text-primary" /> Cấu hình phí giao hàng
            </h2>
            <p className="mt-1 text-sm text-(--admin-text-secondary)">
              Mọi giá trị tiền được lưu theo VND nguyên.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(event) =>
                setConfig({ ...config, enabled: event.target.checked })
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
              ["maximumDeliveryDistanceKm", "Khoảng cách tối đa"],
              ["feeRoundingStep", "Bước làm tròn phí"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="grid gap-1.5 text-sm font-medium">
              {label}
              <Input
                className={control}
                type="number"
                min="0"
                value={config[field]}
                onChange={(event) =>
                  setConfig({ ...config, [field]: Number(event.target.value) })
                }
              />
            </label>
          ))}
          <label className="grid gap-1.5 text-sm font-medium">
            Làm tròn khoảng cách
            <select
              className="h-10 w-full rounded-lg border border-(--admin-border) bg-white px-3 text-sm"
              value={config.distanceRoundingMode}
              onChange={(event) =>
                setConfig({
                  ...config,
                  distanceRoundingMode: event.target.value,
                })
              }
            >
              <option value="EXACT">Chính xác</option>
              <option value="UP_TO_0_5_KM">Lên 0,5km</option>
              <option value="UP_TO_1_KM">Lên 1km</option>
            </select>
          </label>
        </div>
      </AdminSection>
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
              setPromotion(emptyPromotion);
              setEditing(null);
              setFormOpen(true);
            }}
            className="h-10 gap-2"
          >
            <Plus className="size-4" /> Thêm ưu đãi
          </Button>
        </div>
        {formOpen ? (
          <form
            onSubmit={savePromotion}
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
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Tên chương trình"],
                  ["minimumOrderValue", "Giá trị đơn tối thiểu"],
                  ["freeDistanceKm", "Số km được miễn phí"],
                  ["maximumShippingDiscount", "Giảm tối đa"],
                  ["priority", "Độ ưu tiên"],
                  ["startsAt", "Thời gian bắt đầu"],
                  ["endsAt", "Thời gian kết thúc"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="grid gap-1.5 text-sm font-medium">
                  {label}
                  <Input
                    className={control}
                    type={
                      field === "name"
                        ? "text"
                        : field.includes("At")
                          ? "datetime-local"
                          : "number"
                    }
                    value={promotion[field]}
                    onChange={(event) =>
                      setPromotion({
                        ...promotion,
                        [field]: event.target.value,
                      })
                    }
                  />
                </label>
              ))}
              <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                Mô tả
                <textarea
                  className="min-h-20 rounded-lg border border-(--admin-border) bg-white p-3 text-sm"
                  value={promotion.description}
                  onChange={(event) =>
                    setPromotion({
                      ...promotion,
                      description: event.target.value,
                    })
                  }
                />
              </label>
            </div>
            {preview ? (
              <p className="mt-4 rounded-lg bg-white p-3 text-sm text-(--admin-text-secondary)">
                Ví dụ đơn 600.000đ, khoảng cách 8km: tính phí{" "}
                {preview.chargeable}km · dự kiến {money(preview.fee)}.
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
              <Button type="submit" variant="brand" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu ưu đãi"}
              </Button>
            </div>
          </form>
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
                  {item.freeDistanceKm}km · Ưu tiên {item.priority}
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
                    setPromotion({
                      ...item,
                      minimumOrderValue: String(item.minimumOrderValue),
                      freeDistanceKm: String(item.freeDistanceKm),
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
    </AdminPageContainer>
  );
}
