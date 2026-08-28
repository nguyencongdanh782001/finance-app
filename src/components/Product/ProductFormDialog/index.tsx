"use client";
/* eslint-disable @next/next/no-img-element */
import { Field, Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { NumericInput } from "@/components/ui/numberInput";
import { ProductFormValues } from "@/interface/product";
import { CategoryItemData } from "@/interface/category";
import { CustomInputProps, CustomSelectProps } from "@/interface/Field";
import { isHeicLikeFile } from "@/lib/image-file";
import { toast } from "@/hook/use-toast";
import {
  ChevronDown,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type ProductImageDraft = {
  id?: number;
  url: string;
  publicId?: string;
  isPrimary: boolean;
  position: number;
  file?: File;
};
type Props = {
  open: boolean;
  mode: "create" | "edit";
  categories: CategoryItemData[];
  initialValues: ProductFormValues;
  initialImages?: ProductImageDraft[];
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: ProductFormValues,
    files: File[],
    images: ProductImageDraft[],
  ) => Promise<boolean> | boolean;
  onDelete?: () => void;
};
const schema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Vui lòng nhập tên sản phẩm")
    .max(180, "Tên sản phẩm quá dài"),
  categoryId: Yup.string().required("Vui lòng chọn danh mục"),
  importPrice: Yup.number()
    .typeError("Nhập giá vốn hợp lệ")
    .min(0, "Giá không thể âm")
    .required(),
  sellPrice: Yup.number()
    .typeError("Nhập giá bán hợp lệ")
    .min(0, "Giá không thể âm")
    .required(),
  quantity: Yup.number()
    .typeError("Nhập tồn kho hợp lệ")
    .integer("Tồn kho phải là số nguyên")
    .min(0, "Tồn kho không thể âm")
    .required(),
});
const inputClass = "h-10 rounded-xl border-(--admin-border) bg-white text-sm";
const makeVariant = () => ({
  clientId: `${Date.now()}-${Math.random()}`,
  sku: "",
  size: "",
  color: "",
  price: "0",
  importPrice: "0",
  quantity: "0",
  isActive: true,
});

export default function ProductFormDialog({
  open,
  mode,
  categories,
  initialValues,
  initialImages = [],
  isDeleting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ProductImageDraft[]>([]);
  const [images, setImages] = useState<ProductImageDraft[]>(initialImages);
  const [converting, setConverting] = useState(false);
  const [colors, setColors] = useState("");
  const [sizes, setSizes] = useState("");
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, actions) => {
      const ok = await onSubmit(
        { ...values, title: values.title.trim(), slug: values.slug.trim() },
        images.flatMap((image) => (image.file ? [image.file] : [])),
        images,
      );
      actions.setSubmitting(false);
      if (ok) actions.resetForm();
    },
  });
  useEffect(() => {
    if (open) {
      const normalized = initialImages.map((image, index) => ({
        ...image,
        position: index,
        isPrimary: image.isPrimary || index === 0,
      }));
      setImages(normalized);
      imagesRef.current = normalized;
    }
  }, [open, initialImages]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () =>
      imagesRef.current.forEach((image) => {
        if (image.file && image.url.startsWith("blob:"))
          URL.revokeObjectURL(image.url);
      }),
    [],
  );
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );
  const pickImages = async (list: FileList | null) => {
    if (!list) return;
    setConverting(true);
    const added: ProductImageDraft[] = [];
    for (const original of Array.from(list)) {
      if (original.size > 5 * 1024 * 1024) {
        toast({ title: "Ảnh vượt quá 5MB", className: "bg-red-1 text-white" });
        continue;
      }
      let file = original;
      if (isHeicLikeFile(original)) {
        try {
          const { default: convert } = await import("heic2any");
          const blob = await convert({
            blob: original,
            toType: "image/jpeg",
            quality: 0.9,
          });
          file = new File(
            [Array.isArray(blob) ? blob[0] : blob],
            original.name.replace(/\.(heic|heif)$/i, ".jpg"),
            { type: "image/jpeg" },
          );
        } catch {
          toast({
            title: "Không thể chuyển ảnh HEIC",
            className: "bg-red-1 text-white",
          });
          continue;
        }
      }
      added.push({
        url: URL.createObjectURL(file),
        file,
        position: images.length + added.length,
        isPrimary: images.length === 0 && added.length === 0,
      });
    }
    setImages((current) =>
      [...current, ...added].map((image, index) => ({
        ...image,
        position: index,
        isPrimary: image.isPrimary || index === 0,
      })),
    );
    setConverting(false);
    if (fileRef.current) fileRef.current.value = "";
  };
  const generate = () => {
    const cs = colors
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const ss = sizes
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const combos = (cs.length ? cs : [""]).flatMap((color) =>
      (ss.length ? ss : [""]).map((size) => ({ color, size })),
    );
    const existing = new Set(
      formik.values.variants.map((v) => `${v.color}|${v.size}`),
    );
    formik.setFieldValue("variants", [
      ...formik.values.variants,
      ...combos
        .filter((v) => !existing.has(`${v.color}|${v.size}`))
        .map((v) => ({
          ...makeVariant(),
          ...v,
          price: formik.values.sellPrice,
          importPrice: formik.values.importPrice,
        })),
    ]);
  };
  const applyAll = (key: "price" | "importPrice" | "quantity", value: string) =>
    formik.setFieldValue(
      "variants",
      formik.values.variants.map((variant) => ({ ...variant, [key]: value })),
    );
  const money = (value: string) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) formik.resetForm();
      }}
    >
      <DialogContent className="w-[calc(100%-20px)] max-w-6xl overflow-hidden rounded-2xl border-(--admin-border) bg-(--admin-background) p-0">
        <div className="flex max-h-[94svh] min-h-0 flex-col">
          <FormikProvider value={formik}>
            <Form className="min-h-0 flex-1 overflow-y-auto">
              <header className="sticky top-0 z-20 flex items-center justify-between border-b border-(--admin-border) bg-white px-5 py-4 sm:px-8">
                <div>
                  <DialogTitle className="text-lg font-bold text-(--admin-text)">
                    {mode === "create" ? "Tạo sản phẩm" : "Chỉnh sửa sản phẩm"}
                  </DialogTitle>
                  <p className="mt-1 text-xs text-(--admin-text-secondary)">
                    {mode === "create"
                      ? "Thêm sản phẩm mới vào cửa hàng"
                      : "Cập nhật thông tin, biến thể và tồn kho"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Đóng"
                  className="rounded-full p-2 text-slate-400 hover:bg-(--admin-primary-soft)"
                >
                  <X className="size-5" />
                </button>
              </header>
              <div className="grid gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                <main className="space-y-5">
                  <Section title="1. Thông tin cơ bản">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Block label="Tên sản phẩm" required>
                        <AutoCompleteField<CustomInputProps>
                          component={Input}
                          version="field"
                          name="title"
                          placeholder="Ví dụ: Áo sơ mi linen"
                          className={inputClass}
                        />
                      </Block>
                      <Block label="Đường dẫn">
                        <AutoCompleteField<CustomInputProps>
                          component={Input}
                          version="field"
                          name="slug"
                          placeholder="tu-dong-tao-tu-ten"
                          className={inputClass}
                        />
                      </Block>
                    </div>
                    <Block label="Mô tả sản phẩm">
                      <Field
                        name="description"
                        as={Textarea}
                        className="min-h-24 rounded-xl border-(--admin-border)"
                      />
                    </Block>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Block label="Đối tượng">
                        <AutoCompleteField<CustomSelectProps>
                          component={CustomSelect}
                          version="field"
                          name="gender"
                          placeholder="Chọn đối tượng"
                          optionValue={[
                            { value: "WOMEN", label: "Nữ" },
                            { value: "MEN", label: "Nam" },
                            { value: "UNISEX", label: "Unisex" },
                            { value: "KIDS", label: "Trẻ em" },
                          ]}
                          className="w-full!"
                          inputClassName={inputClass}
                        />
                      </Block>
                      <Block label="Danh mục" required>
                        <AutoCompleteField<CustomSelectProps>
                          component={CustomSelect}
                          version="field"
                          name="categoryId"
                          placeholder="Chọn danh mục"
                          optionValue={categoryOptions}
                          searchable
                          className="w-full!"
                          inputClassName={inputClass}
                        />
                      </Block>
                    </div>
                  </Section>
                  <Section title="2. Hình ảnh sản phẩm">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {images.map((image, index) => (
                        <div
                          key={image.id ?? image.url}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-(--admin-border) bg-slate-50"
                        >
                          <img
                            src={image.url}
                            alt="Ảnh sản phẩm"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-x-1 top-1 flex justify-between gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setImages((current) =>
                                  current.map((item, i) => ({
                                    ...item,
                                    isPrimary: i === index,
                                  })),
                                )
                              }
                              className={`truncate rounded-md px-2 py-1 text-10px font-bold ${image.isPrimary ? "bg-(--admin-primary) text-white" : "bg-white/90 text-slate-500"}`}
                            >
                              {image.isPrimary
                                ? "Ảnh đại diện"
                                : "Chọn ảnh bìa"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setImages((current) =>
                                  current
                                    .filter((_, i) => i !== index)
                                    .map((image, imageIndex) => ({
                                      ...image,
                                      position: imageIndex,
                                      isPrimary: imageIndex === 0,
                                    })),
                                )
                              }
                              className="rounded-full bg-white/90 p-1 text-red-500"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <GripVertical className="absolute bottom-1 left-1 size-4 text-white drop-shadow" />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={converting}
                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--admin-primary-border) bg-(--admin-primary-soft) text-xs font-semibold text-(--admin-primary)"
                      >
                        <ImagePlus className="size-6" />
                        {converting ? "Đang xử lý..." : "Thêm ảnh"}
                      </button>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.heic,.heif"
                      multiple
                      className="hidden"
                      onChange={(event) => void pickImages(event.target.files)}
                    />
                    <p className="mt-3 text-xs text-(--admin-text-muted)">
                      PNG, JPG, HEIC · tối đa 5MB/ảnh.
                    </p>
                  </Section>
                  <Section title="3. Phân loại sản phẩm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Block label="Màu sắc">
                        <Input
                          standalone
                          value={colors}
                          onChange={(e) => setColors(e.target.value)}
                          placeholder="Đen, Trắng, Hồng"
                          className={inputClass}
                        />
                      </Block>
                      <Block label="Kích thước">
                        <Input
                          standalone
                          value={sizes}
                          onChange={(e) => setSizes(e.target.value)}
                          placeholder="S, M, L, XL"
                          className={inputClass}
                        />
                      </Block>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={generate}
                      className="mt-3 border-(--admin-primary-border) text-(--admin-primary)"
                    >
                      <Plus className="size-4" />
                      Tạo tổ hợp biến thể
                    </Button>
                  </Section>
                  <Section title="4. Giá bán và giá vốn">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Block label="Giá bán">
                        <AutoCompleteField<CustomInputProps>
                          component={NumericInput}
                          version="field"
                          name="sellPrice"
                          placeholder="0"
                          className={inputClass}
                        />
                        <p className="text-xs text-slate-400">
                          {money(formik.values.sellPrice)}
                        </p>
                      </Block>
                      <Block label="Giá vốn">
                        <AutoCompleteField<CustomInputProps>
                          component={NumericInput}
                          version="field"
                          name="importPrice"
                          placeholder="0"
                          className={inputClass}
                        />
                        <p className="text-xs text-slate-400">
                          {money(formik.values.importPrice)}
                        </p>
                      </Block>
                      <Block label="Tồn kho">
                        <AutoCompleteField<CustomInputProps>
                          component={NumericInput}
                          version="field"
                          name="quantity"
                          placeholder="0"
                          className={inputClass}
                        />
                      </Block>
                    </div>
                  </Section>
                  <Section title="5. Biến thể và tồn kho">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {(
                        [
                          ["price", "Áp dụng giá", formik.values.sellPrice],
                          [
                            "importPrice",
                            "Áp dụng giá vốn",
                            formik.values.importPrice,
                          ],
                          [
                            "quantity",
                            "Áp dụng tồn kho",
                            formik.values.quantity,
                          ],
                        ] as const
                      ).map(([key, label, value]) => (
                        <Bulk
                          key={key}
                          label={label}
                          value={value}
                          onApply={(v) => applyAll(key, v)}
                        />
                      ))}
                    </div>
                    {formik.values.variants.length === 0 ? (
                      <p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
                        Chưa có biến thể. Sản phẩm dùng giá và tồn kho mặc định.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {formik.values.variants.map((variant, index) => (
                          <div
                            key={variant.clientId}
                            className="rounded-xl border border-(--admin-border) bg-white p-3"
                          >
                            <div className="flex gap-2">
                              <GripVertical className="mt-3 size-4 shrink-0 text-slate-300" />
                              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                <Input
                                  standalone
                                  value={[variant.color, variant.size]
                                    .filter(Boolean)
                                    .join(" / ")}
                                  readOnly
                                  className={`${inputClass} bg-slate-50`}
                                />
                                <Input
                                  standalone
                                  value={variant.sku}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      `variants[${index}].sku`,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="SKU"
                                  className={inputClass}
                                />
                                <Input
                                  standalone
                                  value={variant.price}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      `variants[${index}].price`,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Giá bán"
                                  inputMode="numeric"
                                  className={inputClass}
                                />
                                <Input
                                  standalone
                                  value={variant.importPrice}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      `variants[${index}].importPrice`,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Giá vốn"
                                  inputMode="numeric"
                                  className={inputClass}
                                />
                                <Input
                                  standalone
                                  value={variant.quantity}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      `variants[${index}].quantity`,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Tồn kho"
                                  inputMode="numeric"
                                  className={inputClass}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  formik.setFieldValue(
                                    "variants",
                                    formik.values.variants.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                                className="p-2 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            <label className="mt-2 flex items-center gap-2 pl-6 text-xs text-slate-500">
                              <Input
                                standalone
                                type="checkbox"
                                checked={variant.isActive}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `variants[${index}].isActive`,
                                    e.target.checked,
                                  )
                                }
                              />
                              Đang bán
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                  <Section title="6. Trạng thái">
                    <div className="grid gap-4">
                      <Block label="Trạng thái">
                        <AutoCompleteField<CustomSelectProps>
                          component={CustomSelect}
                          version="field"
                          name="productStatus"
                          placeholder="Chọn trạng thái"
                          optionValue={[
                            { value: "PUBLIC", label: "Công khai" },
                            { value: "PRIVATE", label: "Riêng tư" },
                            { value: "DISCONTINUED", label: "Ngừng bán" },
                          ]}
                          className="w-full!"
                          inputClassName={inputClass}
                        />
                      </Block>
                    </div>
                    <p className="text-xs text-slate-400">
                      Công khai cho phép bán; riêng tư chỉ hiển thị trong Admin;
                      ngừng bán sẽ không thể thêm vào đơn mới.
                    </p>
                  </Section>
                  <Section title="7. SEO" collapsible>
                    <Block label="Tiêu đề SEO">
                      <Field
                        name="seoTitle"
                        as={Input}
                        maxLength={70}
                        className={inputClass}
                      />
                    </Block>
                    <Block label="Mô tả SEO">
                      <Field
                        name="seoDescription"
                        as={Textarea}
                        maxLength={160}
                        className="min-h-20 rounded-xl"
                      />
                    </Block>
                  </Section>
                </main>
                <aside className="h-fit lg:sticky lg:top-20">
                  <div className="rounded-2xl border border-(--admin-border) bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Tóm tắt
                    </p>
                    <p className="mt-3 line-clamp-2 font-bold text-(--admin-text)">
                      {formik.values.title || "Tên sản phẩm"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formik.values.variants.length
                        ? `${formik.values.variants.length} biến thể`
                        : "Sản phẩm đơn"}
                    </p>
                    <p className="mt-4 border-t pt-3 text-lg font-bold text-(--admin-primary)">
                      {money(formik.values.sellPrice)}
                    </p>
                  </div>
                </aside>
              </div>
            </Form>
            <footer className="sticky bottom-0 z-20 flex flex-wrap justify-end gap-2 border-t border-(--admin-border) bg-white px-5 py-3 sm:px-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="whitespace-nowrap rounded-xl"
              >
                Hủy
              </Button>
              {mode === "edit" && onDelete ? (
                <Button
                  type="button"
                  variant="adminDanger"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="whitespace-nowrap rounded-xl"
                >
                  <Trash2 className="size-4" />
                  Xóa sản phẩm
                </Button>
              ) : null}
              <Button
                type="submit"
                variant="adminPrimary"
                disabled={formik.isSubmitting || converting}
                className="whitespace-nowrap rounded-xl"
              >
                {formik.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {mode === "create" ? "Lưu sản phẩm" : "Lưu thay đổi"}
              </Button>
            </footer>
          </FormikProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function Section({
  title,
  children,
  collapsible = false,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-2xl border border-(--admin-border) bg-white p-4 shadow-sm sm:p-5">
      <button
        type="button"
        onClick={() => collapsible && setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-sm font-bold text-(--admin-text)">{title}</h2>
        {collapsible ? (
          <ChevronDown
            className={`size-4 text-slate-400 ${open ? "" : "-rotate-90"}`}
          />
        ) : null}
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
function Block({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-(--admin-text-secondary)">
        {label}
        {required ? <span className="text-(--admin-primary)"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
function Bulk({
  label,
  value,
  onApply,
}: {
  label: string;
  value: string;
  onApply: (value: string) => void;
}) {
  const [input, setInput] = useState(value);
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-slate-50 p-1">
      <span className="px-1 text-11px text-slate-500">{label}</span>
      <Input
        standalone
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="h-7 w-16 border-0 text-xs"
        inputMode="numeric"
      />
      <Button
        type="button"
        variant="ghost"
        onClick={() => onApply(input)}
        className="h-7 px-2 text-11px text-(--admin-primary)"
      >
        Áp dụng
      </Button>
    </div>
  );
}
