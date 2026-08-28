"use client";
/* eslint-disable @next/next/no-img-element */
import { Form, FormikProvider, useFormik, type FormikProps } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { financeAPI } from "@/endpoint/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import { toast } from "@/hook/use-toast";
import type { CustomInputProps, CustomSelectProps } from "@/interface/Field";
import type { CategoryApiItem } from "@/interface/category";
import type {
  ProductDraftApiItem,
  ProductFormStep,
  ProductFormValues,
  ProductImageDraftValue,
} from "@/interface/product";
import { isHeicLikeFile } from "@/lib/image-file";
import {
  validateProductFinal,
  validateProductStep,
  type ProductValidationError,
} from "@/lib/products/product-draft-validation";

const STEPS: Array<{ id: ProductFormStep; label: string }> = [
  { id: "info", label: "Thông tin" },
  { id: "category", label: "Danh mục" },
  { id: "images", label: "Hình ảnh" },
  { id: "variants", label: "Biến thể & tồn kho" },
  { id: "review", label: "Kiểm tra & hoàn tất" },
];
const EMPTY: ProductFormValues = {
  title: "",
  slug: "",
  description: "",
  categoryId: "",
  importPrice: "0",
  sellPrice: "0",
  quantity: "0",
  gender: "",
  productStatus: "DRAFT",
  visibility: "PUBLIC",
  seoTitle: "",
  seoDescription: "",
  variants: [],
};
const inputClass =
  "h-11 rounded-xl border-(--admin-border) bg-white px-3 text-sm";
const clientId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function ProductWizard({
  mode,
  productId,
}: {
  mode: "CREATE" | "EDIT";
  productId?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<ProductDraftApiItem | null>(null);
  const [images, setImages] = useState<ProductImageDraftValue[]>([]);
  const [categories, setCategories] = useState<CategoryApiItem[]>([]);
  const [step, setStep] = useState<ProductFormStep>(
    (searchParams.get("step") as ProductFormStep) || "info",
  );
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error" | "conflict"
  >("idle");
  const [isApplying, setApplying] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    ProductValidationError[]
  >([]);
  const lastSaved = useRef("");
  const saveTimer = useRef<number | null>(null);
  const recoveryKey = `product-draft-recovery:${mode}:${productId || "new"}`;
  const formik = useFormik({
    initialValues: EMPTY,
    enableReinitialize: true,
    onSubmit: () => undefined,
  });
  useEffect(() => {
    const refreshCategories = () => {
      void financeAPI
        .getCategoryList()
        .then((res) => res.data && setCategories(res.data));
    };
    refreshCategories();
    window.addEventListener("focus", refreshCategories);
    return () => window.removeEventListener("focus", refreshCategories);
  }, []);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const queryDraftId = Number(searchParams.get("draftId") || 0);
      const response = queryDraftId
        ? await fetch(`/api/product-drafts/${queryDraftId}`)
        : await fetch("/api/product-drafts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode,
              originalProductId: productId,
              currentStep: step,
            }),
          });
      const loaded = await response.json();
      if (!active || !response.ok) return;
      const data = loaded.data || {};
      const local = localStorage.getItem(recoveryKey);
      const localData = local ? JSON.parse(local) : null;
      const restored =
        localData?.updatedAt > new Date(loaded.updatedAt).getTime()
          ? localData.data
          : data;
      formik.resetForm({
        values: { ...EMPTY, ...restored, variants: restored.variants || [] },
      });
      setImages(restored.images || []);
      setDraft(loaded);
      setStep((loaded.currentStep as ProductFormStep) || "info");
      lastSaved.current = JSON.stringify({
        values: { ...EMPTY, ...data, variants: data.variants || [] },
        images: data.images || [],
        step: loaded.currentStep || "info",
      });
    };
    void load();
    return () => {
      active = false;
    };
  }, [mode, productId]);
  const serialized = useMemo(
    () => JSON.stringify({ values: formik.values, images, step }),
    [formik.values, images, step],
  );
  const validationData = useMemo(
    () => ({ ...formik.values, images }),
    [formik.values, images],
  );
  useEffect(() => {
    setValidationErrors((current) => {
      const checkedSteps = [...new Set(current.map((error) => error.step))];
      if (!checkedSteps.length) return current;
      const next = checkedSteps.flatMap((checkedStep) =>
        validateProductStep(validationData, checkedStep),
      );
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [validationData]);
  const focusFirstError = (errors: ProductValidationError[]) => {
    if (!errors.length) return;
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-field-path="${CSS.escape(errors[0].path)}"]`,
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    }, 50);
  };
  const saveDraft = async (manual = false) => {
    if (!draft || serialized === lastSaved.current) return true;
    setSaveState("saving");
    localStorage.setItem(
      recoveryKey,
      JSON.stringify({
        updatedAt: Date.now(),
        data: { ...formik.values, images },
      }),
    );
    const response = await fetch(`/api/product-drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: draft.version,
        currentStep: step,
        data: { ...formik.values, images },
      }),
    });
    const result = await response.json();
    if (response.status === 409) {
      setSaveState("conflict");
      return false;
    }
    if (!response.ok) {
      setSaveState("error");
      return false;
    }
    setDraft(result);
    lastSaved.current = serialized;
    localStorage.removeItem(recoveryKey);
    setSaveState("saved");
    if (manual)
      toast({ title: "Đã lưu bản nháp", className: "bg-green-16 text-white" });
    return true;
  };
  useEffect(() => {
    if (!draft || serialized === lastSaved.current) return;
    setSaveState("idle");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void saveDraft(), 1000);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [serialized, draft?.id, draft?.version]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (
        ["saving", "error", "idle"].includes(saveState) &&
        serialized !== lastSaved.current
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [saveState, serialized]);
  const goStep = (next: ProductFormStep) => {
    const currentIndex = STEPS.findIndex((item) => item.id === step);
    const nextIndex = STEPS.findIndex((item) => item.id === next);
    if (nextIndex > currentIndex) {
      const errors = validateProductStep(validationData, step);
      if (step === "images" && isUploading)
        errors.unshift({
          path: "images",
          message: "Vui lòng chờ hình ảnh tải lên hoàn tất.",
          step: "images",
        });
      setValidationErrors((current) => [
        ...current.filter((error) => error.step !== step),
        ...errors,
      ]);
      if (errors.length) {
        focusFirstError(errors);
        return;
      }
    }
    setStep(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", next);
    if (draft) params.set("draftId", String(draft.id));
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  const uploadFiles = async (files: FileList | null, variantIndex?: number) => {
    if (!files) return;
    const selected = Array.from(files);
    const currentCount =
      variantIndex === undefined
        ? images.length
        : formik.values.variants[variantIndex].images?.length || 0;
    if (currentCount + selected.length > 12) {
      toast({
        title: "Đã vượt quá 12 hình ảnh cho phép",
        className: "bg-red-1 text-white",
      });
      return;
    }
    setUploading(true);
    try {
      const validFiles = selected.filter((file) => {
        const supported =
          file.type.startsWith("image/") || isHeicLikeFile(file);
        const validSize = file.size <= 5 * 1024 * 1024;
        if (!supported || !validSize)
          toast({
            title: !supported
              ? "Định dạng hình ảnh không được hỗ trợ"
              : "Hình ảnh không được vượt quá 5MB",
            className: "bg-red-1 text-white",
          });
        return supported && validSize;
      });
      const results = await Promise.all(
        validFiles.map(async (file) => ({
          file,
          response: await financeAPI.uploadImage(file),
        })),
      );
      const uploaded = results.flatMap<ProductImageDraftValue>(
        ({ response }) =>
          response.code === RESPONSE_CODES.success && response.data
            ? [
                {
                  clientId: clientId(),
                  url: response.data.url,
                  publicId: response.data.publicId,
                  position: 0,
                  isPrimary: false,
                },
              ]
            : [],
      );
      const failedCount = results.length - uploaded.length;
      if (failedCount)
        toast({
          title: `${failedCount} ảnh tải lên thất bại`,
          description: "Vui lòng kiểm tra kết nối và thử lại.",
          className: "bg-red-1 text-white",
        });
      if (variantIndex === undefined)
        setImages((current) =>
          [...current, ...uploaded].map((image, index) => ({
            ...image,
            position: index,
            isPrimary: index === 0,
          })),
        );
      else
        await formik.setFieldValue(
          `variants[${variantIndex}].images`,
          [
            ...(formik.values.variants[variantIndex]?.images || []),
            ...uploaded,
          ].map((image, index) => ({
            ...image,
            position: index,
            isPrimary: index === 0,
          })),
        );
    } finally {
      setUploading(false);
    }
  };
  const addVariant = () =>
    formik.setFieldValue("variants", [
      ...formik.values.variants,
      {
        clientId: clientId(),
        sku: "",
        size: "",
        color: "",
        price: formik.values.sellPrice,
        importPrice: formik.values.importPrice,
        quantity: "0",
        isActive: true,
        images: [],
      },
    ]);
  const apply = async () => {
    if (!draft) return;
    const errors = validateProductFinal(validationData);
    setValidationErrors(errors);
    if (errors.length) {
      goStep(errors[0].step);
      focusFirstError(errors);
      return;
    }
    if (!(await saveDraft())) return;
    setApplying(true);
    const response = await fetch(`/api/product-drafts/${draft.id}/apply`, {
      method: "POST",
    });
    const result = await response.json();
    if (!response.ok) {
      setApplying(false);
      const serverErrors = Array.isArray(result.fieldErrors)
        ? (result.fieldErrors as ProductValidationError[])
        : [];
      if (serverErrors.length) {
        setValidationErrors(serverErrors);
        goStep(serverErrors[0].step);
        focusFirstError(serverErrors);
      } else if (result.step) goStep(result.step);
      toast({
        title: result.message || "Không thể hoàn tất sản phẩm",
        className: "bg-red-1 text-white",
      });
      return;
    }
    localStorage.removeItem(recoveryKey);
    toast({
      title: mode === "CREATE" ? "Đã tạo sản phẩm" : "Đã áp dụng thay đổi",
      className: "bg-green-16 text-white",
    });
    router.push("/admin/products");
  };
  const discard = async () => {
    if (
      !draft ||
      !window.confirm(
        "Bỏ bản nháp này? Sản phẩm đang bán sẽ không bị thay đổi.",
      )
    )
      return;
    const response = await fetch(`/api/product-drafts/${draft.id}/discard`, {
      method: "POST",
    });
    if (!response.ok)
      return toast({
        title: "Không thể bỏ bản nháp",
        className: "bg-red-1 text-white",
      });
    localStorage.removeItem(recoveryKey);
    router.push("/admin/products");
  };
  if (!draft)
    return (
      <AdminPageContainer>
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[520px] rounded-2xl" />
      </AdminPageContainer>
    );
  const currentIndex = STEPS.findIndex((item) => item.id === step);
  const stepErrorCount = (target: ProductFormStep) =>
    validationErrors.filter((error) => error.step === target).length;
  const category = categories.find(
    (item) => String(item.id) === formik.values.categoryId,
  );
  return (
    <AdminPageContainer className="max-w-[1440px]">
      <AdminPageHeader
        title={mode === "CREATE" ? "Tạo sản phẩm" : "Chỉnh sửa sản phẩm"}
        description={
          mode === "CREATE"
            ? "Tạo sản phẩm theo từng bước và tiếp tục bất cứ lúc nào."
            : "Thay đổi được lưu trong bản nháp, chưa ảnh hưởng sản phẩm đang bán."
        }
        breadcrumb={
          <button
            onClick={() => router.push("/admin/products")}
            className="inline-flex items-center gap-1 hover:text-(--admin-primary)"
          >
            <ArrowLeft className="size-3.5" /> Sản phẩm
          </button>
        }
        actions={
          <div className="flex items-center gap-3">
            <SaveStatus state={saveState} />
            <Button
              type="button"
              variant="ghost"
              className="text-red-500"
              onClick={() => void discard()}
            >
              <Trash2 className="size-4" />
              Bỏ bản nháp
            </Button>
            <Button
              variant="ghost"
              className="border border-(--admin-border)"
              onClick={() => void saveDraft(true)}
            >
              <Save className="size-4" />
              Lưu tạm
            </Button>
          </div>
        }
      />
      <nav
        aria-label="Các bước tạo sản phẩm"
        className="rounded-2xl border border-(--admin-border) bg-white p-3"
      >
        <div className="hidden grid-cols-5 gap-2 md:grid">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => index <= currentIndex && goStep(item.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold ${index === currentIndex ? "bg-(--admin-primary-soft) text-(--admin-primary)" : index < currentIndex ? "text-(--admin-primary)" : "text-slate-400"}`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full ${index <= currentIndex ? "bg-(--admin-primary) text-white" : "bg-slate-100"}`}
              >
                {index < currentIndex ? (
                  <Check className="size-4" />
                ) : (
                  index + 1
                )}
              </span>
              {item.label}
              {stepErrorCount(item.id) ? (
                <span
                  className="ml-auto size-2 rounded-full bg-red-500"
                  aria-label={`${stepErrorCount(item.id)} lỗi`}
                />
              ) : null}
            </button>
          ))}
        </div>
        <div className="md:hidden">
          <p className="text-xs font-semibold text-(--admin-primary)">
            Bước {currentIndex + 1}/5
          </p>
          <p className="mt-1 font-bold text-(--admin-text)">
            {STEPS[currentIndex].label}
            {stepErrorCount(step) ? ` · Có ${stepErrorCount(step)} lỗi` : ""}
          </p>
        </div>
      </nav>
      <FormikProvider value={formik}>
        <Form>
          <AdminSection className="min-h-[480px]">
            <StepContent
              step={step}
              formik={formik}
              categories={categories}
              category={category}
              images={images}
              setImages={setImages}
              uploadFiles={uploadFiles}
              isUploading={isUploading}
              addVariant={addVariant}
              errors={validationErrors}
              onErrorClick={(error) => {
                goStep(error.step);
                focusFirstError([error]);
              }}
            />
          </AdminSection>
          <div className="sticky bottom-3 z-20 mt-4 flex justify-between rounded-2xl border border-(--admin-border) bg-white/95 p-3 shadow-lg backdrop-blur">
            <Button
              type="button"
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => goStep(STEPS[currentIndex - 1].id)}
            >
              <ChevronLeft className="size-4" />
              Quay lại
            </Button>
            {currentIndex < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="adminPrimary"
                onClick={() => goStep(STEPS[currentIndex + 1].id)}
              >
                Tiếp tục
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="adminPrimary"
                disabled={isApplying || isUploading}
                onClick={() => void apply()}
              >
                {isApplying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {mode === "CREATE" ? "Hoàn tất sản phẩm" : "Áp dụng thay đổi"}
              </Button>
            )}
          </div>
        </Form>
      </FormikProvider>
    </AdminPageContainer>
  );
}

type StepContentProps = {
  step: ProductFormStep;
  formik: FormikProps<ProductFormValues>;
  categories: CategoryApiItem[];
  category?: CategoryApiItem;
  images: ProductImageDraftValue[];
  setImages: React.Dispatch<React.SetStateAction<ProductImageDraftValue[]>>;
  uploadFiles: (files: FileList | null, variantIndex?: number) => Promise<void>;
  isUploading: boolean;
  addVariant: () => void;
  errors: ProductValidationError[];
  onErrorClick: (error: ProductValidationError) => void;
};

function StepContent({
  step,
  formik,
  categories,
  category,
  images,
  setImages,
  uploadFiles,
  isUploading,
  addVariant,
  errors,
  onErrorClick,
}: StepContentProps) {
  const errorFor = (path: string) =>
    errors.find((error) => error.path === path)?.message;
  if (step === "info")
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Heading
          title="Thông tin sản phẩm"
          text="Tên, mô tả và mức giá mặc định."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldBox
            label="Tên sản phẩm"
            path="title"
            required
            error={errorFor("title")}
          >
            <AutoCompleteField<CustomInputProps>
              component={Input}
              version="field"
              name="title"
              className={inputClass}
              placeholder="Ví dụ: Áo thun cotton"
              aria-required="true"
            />
          </FieldBox>
          <FieldBox label="Đường dẫn" path="slug" error={errorFor("slug")}>
            <AutoCompleteField<CustomInputProps>
              component={Input}
              version="field"
              name="slug"
              className={inputClass}
              placeholder="Tự tạo từ tên"
            />
          </FieldBox>
        </div>
        <FieldBox
          label="Mô tả"
          path="description"
          error={errorFor("description")}
          optional
        >
          <Textarea
            name="description"
            value={formik.values.description}
            onChange={(event) =>
              formik.setFieldValue("description", event.target.value)
            }
            className="min-h-28 rounded-xl"
          />
        </FieldBox>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["sellPrice", "Giá bán"],
            ["importPrice", "Giá vốn"],
            ["quantity", "Tồn kho mặc định"],
          ].map(([name, label]) => (
            <FieldBox
              key={name}
              label={label}
              path={name}
              required
              error={errorFor(name)}
            >
              <AutoCompleteField<CustomInputProps>
                component={NumericInput}
                version="field"
                name={name}
                className={inputClass}
                placeholder="0"
                aria-required="true"
              />
            </FieldBox>
          ))}
        </div>
        {Number(formik.values.importPrice) > Number(formik.values.sellPrice) ? (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            Giá vốn đang cao hơn giá bán.
          </p>
        ) : null}
      </div>
    );
  if (step === "category")
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Heading
          title="Danh mục và hiển thị"
          text="Chọn đúng nhóm để sản phẩm dễ tìm kiếm."
        />
        <FieldBox
          label="Danh mục"
          path="categoryId"
          required
          error={errorFor("categoryId")}
        >
          <AutoCompleteField<CustomSelectProps>
            component={CustomSelect}
            version="field"
            name="categoryId"
            searchable
            fullWidth
            className="h-11! w-full! min-w-0! rounded-xl!"
            inputClassName="h-11! w-full! rounded-xl! border-(--admin-border)! bg-white! px-3! text-sm! font-medium! text-(--admin-text)!"
            placeholder="Tìm và chọn danh mục"
            aria-required="true"
            optionValue={categories.map((item: CategoryApiItem) => ({
              value: String(item.id),
              label: item.parent
                ? `${item.parent.name} / ${item.name}`
                : item.name,
            }))}
          />
        </FieldBox>
        {category ? (
          <p className="rounded-xl bg-(--admin-primary-soft) p-3 text-sm text-(--admin-primary)">
            Đã chọn: {category.parent ? `${category.parent.name} / ` : ""}
            {category.name}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldBox label="Đối tượng" path="gender" optional>
            <AutoCompleteField<CustomSelectProps>
              component={CustomSelect}
              version="field"
              name="gender"
              fullWidth
              className="h-11! w-full! min-w-0! rounded-xl!"
              inputClassName="h-11! w-full! rounded-xl! border-(--admin-border)! bg-white! px-3! text-sm! font-medium! text-(--admin-text)!"
              placeholder="Chọn đối tượng"
              optionValue={[
                { value: "WOMEN", label: "Nữ" },
                { value: "MEN", label: "Nam" },
                { value: "UNISEX", label: "Unisex" },
                { value: "KIDS", label: "Trẻ em" },
              ]}
            />
          </FieldBox>
          <FieldBox
            label="Trạng thái"
            path="productStatus"
            required
            error={errorFor("productStatus")}
          >
            <AutoCompleteField<CustomSelectProps>
              component={CustomSelect}
              version="field"
              name="productStatus"
              fullWidth
              className="h-11! w-full! min-w-0! rounded-xl!"
              inputClassName="h-11! w-full! rounded-xl! border-(--admin-border)! bg-white! px-3! text-sm! font-medium! text-(--admin-text)!"
              placeholder="Trạng thái"
              optionValue={[
                { value: "DRAFT", label: "Bản nháp" },
                { value: "ACTIVE", label: "Đang bán" },
                { value: "ARCHIVED", label: "Lưu trữ" },
              ]}
            />
          </FieldBox>
          <FieldBox
            label="Hiển thị"
            path="visibility"
            required
            error={errorFor("visibility")}
          >
            <AutoCompleteField<CustomSelectProps>
              component={CustomSelect}
              version="field"
              name="visibility"
              fullWidth
              className="h-11! w-full! min-w-0! rounded-xl!"
              inputClassName="h-11! w-full! rounded-xl! border-(--admin-border)! bg-white! px-3! text-sm! font-medium! text-(--admin-text)!"
              placeholder="Hiển thị"
              optionValue={[
                { value: "PUBLIC", label: "Công khai" },
                { value: "HIDDEN", label: "Ẩn" },
                { value: "PRIVATE", label: "Riêng tư" },
              ]}
            />
          </FieldBox>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="border border-(--admin-primary-border) text-(--admin-primary)"
          onClick={() => window.open("/admin/categories", "_blank")}
        >
          <Plus className="size-4" />
          Thêm danh mục
        </Button>
      </div>
    );
  if (step === "images")
    return (
      <div className="space-y-5">
        <Heading
          title="Hình ảnh sản phẩm"
          text="Ảnh đầu tiên là ảnh đại diện. Có thể sắp xếp bằng các nút điều hướng."
        />
        <div
          data-field-path="images"
          tabIndex={-1}
          aria-describedby={errorFor("images") ? "error-images" : undefined}
        >
          <Gallery images={images} onChange={setImages} />
          {errorFor("images") ? (
            <p
              id="error-images"
              role="alert"
              className="mt-2 text-sm text-red-500"
            >
              {errorFor("images")}
            </p>
          ) : null}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-(--admin-primary) px-4 py-2 text-sm font-semibold text-white">
          <ImagePlus className="size-4" />
          {isUploading ? "Đang tải..." : "Tải ảnh lên"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const input = event.currentTarget;
              void uploadFiles(input.files).finally(() => {
                input.value = "";
              });
            }}
          />
        </label>
      </div>
    );
  if (step === "variants")
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading
            title="Biến thể và tồn kho"
            text="Mỗi biến thể có SKU, giá, tồn kho và bộ ảnh riêng."
          />
          <Button
            type="button"
            variant="ghost"
            className="border border-(--admin-primary-border) text-(--admin-primary)"
            onClick={addVariant}
          >
            <Plus className="size-4" />
            Thêm biến thể
          </Button>
        </div>
        {errorFor("variants") ? (
          <p
            data-field-path="variants"
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {errorFor("variants")}
          </p>
        ) : null}
        {formik.values.variants.length ? (
          formik.values.variants.map((variant, index) => (
            <div
              key={variant.clientId}
              className="rounded-2xl border border-(--admin-border) p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                {(
                  [
                    ["color", "Màu"],
                    ["size", "Size"],
                    ["sku", "SKU"],
                    ["price", "Giá bán"],
                    ["importPrice", "Giá vốn"],
                    ["quantity", "Tồn kho"],
                  ] as const
                ).map(([key, label]) => {
                  const isNumeric = [
                    "price",
                    "importPrice",
                    "quantity",
                  ].includes(key);
                  return (
                    <FieldBox
                      key={key}
                      label={label}
                      path={`variants.${variant.clientId}.${key}`}
                      required={variant.isActive}
                      error={
                        errorFor(`variants.${variant.clientId}.${key}`) ||
                        (key === "color" || key === "size"
                          ? errorFor(`variants.${variant.clientId}.options`)
                          : undefined)
                      }
                    >
                      {isNumeric ? (
                        <NumericInput
                          standalone
                          value={variant[key]}
                          onManualChange={(value) =>
                            formik.setFieldValue(
                              `variants[${index}].${key}`,
                              value,
                            )
                          }
                          className={inputClass}
                          aria-required={variant.isActive}
                        />
                      ) : (
                        <Input
                          standalone
                          value={variant[key]}
                          onChange={(event) =>
                            formik.setFieldValue(
                              `variants[${index}].${key}`,
                              event.target.value,
                            )
                          }
                          className={inputClass}
                          aria-required={variant.isActive}
                        />
                      )}
                    </FieldBox>
                  );
                })}
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  Ảnh biến thể · để trống sẽ dùng ảnh chung
                </p>
                <Gallery
                  images={variant.images || []}
                  onChange={(next: ProductImageDraftValue[]) =>
                    formik.setFieldValue(`variants[${index}].images`, next)
                  }
                />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-(--admin-primary)">
                  <ImagePlus className="size-4" />
                  Thêm ảnh riêng
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const input = event.currentTarget;
                      void uploadFiles(input.files, index).finally(() => {
                        input.value = "";
                      });
                    }}
                  />
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mt-3 text-red-500"
                onClick={() =>
                  formik.setFieldValue(
                    "variants",
                    formik.values.variants.filter(
                      (_: unknown, i: number) => i !== index,
                    ),
                  )
                }
              >
                <Trash2 className="size-4" />
                Xóa biến thể
              </Button>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
            Sản phẩm chưa có biến thể và sẽ dùng tồn kho mặc định.
          </p>
        )}
      </div>
    );
  return (
    <div className="space-y-5">
      <Heading
        title="Kiểm tra và hoàn tất"
        text="Xem lại toàn bộ dữ liệu trước khi áp dụng."
      />
      {errors.length ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Sản phẩm chưa thể hoàn tất
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-600">
            {errors.map((error) => (
              <li key={`${error.step}-${error.path}-${error.message}`}>
                <button
                  type="button"
                  className="text-left underline-offset-2 hover:underline"
                  onClick={() => onErrorClick(error)}
                >
                  {STEPS.find((item) => item.id === error.step)?.label}:{" "}
                  {error.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Review label="Sản phẩm" value={formik.values.title || "Chưa nhập"} />
        <Review label="Danh mục" value={category?.name || "Chưa chọn"} />
        <Review
          label="Giá bán"
          value={`${Number(formik.values.sellPrice || 0).toLocaleString("vi-VN")}đ`}
        />
        <Review label="Kho mặc định" value={formik.values.quantity} />
        <Review label="Ảnh chung" value={`${images.length} ảnh`} />
        <Review
          label="Biến thể"
          value={`${formik.values.variants.length} biến thể`}
        />
      </div>
      {formik.values.variants.map((variant) => (
        <div
          key={variant.clientId}
          className="flex items-center justify-between rounded-xl border border-(--admin-border) p-3 text-sm"
        >
          <span>
            {[variant.color, variant.size].filter(Boolean).join(" / ") ||
              "Biến thể"}{" "}
            · {variant.sku}
          </span>
          <span className="text-slate-500">
            {variant.images?.length || 0} ảnh · {variant.quantity} SP
          </span>
        </div>
      ))}
    </div>
  );
}
function Gallery({
  images,
  onChange,
}: {
  images: ProductImageDraftValue[];
  onChange: (images: ProductImageDraftValue[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {images.map((image, index) => (
        <div
          key={image.clientId}
          className="relative size-28 overflow-hidden rounded-xl border border-(--admin-border)"
        >
          <img
            src={image.url}
            alt="Ảnh sản phẩm"
            className="h-full w-full object-cover"
          />
          {index === 0 ? (
            <span className="absolute left-1 top-1 rounded bg-(--admin-primary) px-1.5 py-0.5 text-10px text-white">
              Ảnh chính
            </span>
          ) : null}
          <button
            type="button"
            aria-label="Xóa ảnh"
            onClick={() =>
              onChange(
                images
                  .filter((_, i) => i !== index)
                  .map((item, i) => ({
                    ...item,
                    position: i,
                    isPrimary: i === 0,
                  })),
              )
            }
            className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
function FieldBox({
  label,
  children,
  path,
  required,
  optional,
  error,
}: {
  label: string;
  children: React.ReactNode;
  path?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
}) {
  const errorId = path
    ? `error-${path.replace(/[^a-zA-Z0-9_-]/g, "-")}`
    : undefined;
  return (
    <div
      className="space-y-1.5"
      data-field-path={path}
      aria-describedby={error ? errorId : undefined}
    >
      <Label className="text-xs font-semibold text-(--admin-text-secondary)">
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? (
          <span className="ml-1 font-normal text-slate-400">
            (Không bắt buộc)
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
function Heading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-(--admin-text)">{title}</h2>
      <p className="mt-1 text-sm text-(--admin-text-secondary)">{text}</p>
    </div>
  );
}
function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-(--admin-background-subtle) p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-(--admin-text)">{value}</p>
    </div>
  );
}
function SaveStatus({ state }: { state: string }) {
  return (
    <span
      className={`text-xs ${state === "error" || state === "conflict" ? "text-red-500" : state === "saved" ? "text-green-600" : "text-slate-500"}`}
    >
      {state === "saving"
        ? "Đang lưu..."
        : state === "saved"
          ? "Đã lưu"
          : state === "error"
            ? "Chưa thể lưu"
            : state === "conflict"
              ? "Bản nháp đã thay đổi ở nơi khác"
              : "Có thay đổi chưa lưu"}
    </span>
  );
}
