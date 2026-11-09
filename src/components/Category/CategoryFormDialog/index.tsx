"use client";

import { Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from "@/components/Category/constants";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoryFormValues, CategoryIconOption } from "@/interface/category";
import type { TryOnCategory } from "@/interface/product";
import { CustomInputProps, CustomTextAreaProps } from "@/interface/Field";
import { Check, Loader2, PlusCircle, Trash2 } from "lucide-react";

const TRY_ON_CATEGORY_OPTIONS: Array<{ value: TryOnCategory; label: string }> = [
  { value: "UPPER_BODY", label: "Áo / áo khoác" },
  { value: "LOWER_BODY", label: "Quần / chân váy" },
  { value: "DRESSES", label: "Đầm / váy liền" },
  { value: "SHOES", label: "Dép / giày" },
  { value: "ACCESSORIES", label: "Nón / phụ kiện" },
  { value: "NOT_SUPPORTED", label: "Không hỗ trợ thử đồ" },
];

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Vui lòng nhập tên danh mục")
    .max(40, "Tên danh mục tối đa 40 ký tự"),
  color: Yup.string().required("Vui lòng chọn màu"),
  icon: Yup.string().required("Vui lòng chọn biểu tượng"),
  tryOnCategory: Yup.string().required("Vui lòng chọn loại thử đồ"),
});

interface CategoryFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: CategoryFormValues;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<boolean> | boolean;
  onDelete?: () => void;
}

function IconOption({
  option,
  active,
  onClick,
}: {
  option: CategoryIconOption;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all cursor-pointer ${
        active
          ? "border-primary bg-primary text-white"
          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}

export default function CategoryFormDialog({
  open,
  mode,
  initialValues,
  isDeleting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: CategoryFormDialogProps) {
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, actions) => {
      actions.setSubmitting(true);
      const isSuccess = await onSubmit({
        ...values,
        name: values.name.trim(),
      });
      actions.setSubmitting(false);

      if (isSuccess) {
        actions.resetForm();
      }
    },
  });

  const { values, isSubmitting, setFieldValue } = formik;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          formik.resetForm();
        }
      }}
    >
      <DialogContent className="w-[calc(100%-24px)] max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-xl">
        <div className="px-5 py-6 sm:px-6">
          <FormikProvider value={formik}>
            <Form className="space-y-5">
              <div className="text-center">
                <DialogTitle className="text-base font-semibold text-slate-900">
                  {mode === "create"
                    ? "Thêm danh mục mới"
                    : "Chỉnh sửa danh mục"}
                </DialogTitle>
              </div>

              <div className="space-y-2">
                <Label className="text-11px font-bold text-slate-500">
                  Tên danh mục
                </Label>
                <AutoCompleteField<CustomInputProps>
                  component={Input}
                  version="field"
                  name="name"
                  placeholder="Ví dụ: Đồ gia dụng, Phụ kiện..."
                  className="h-10 rounded-lg! border-slate-200 bg-white px-3 text-sm text-slate-700"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-11px font-bold text-slate-500">
                  Loại sản phẩm cho AI thử đồ
                </Label>
                <AutoCompleteField
                  component={CustomSelect}
                  version="field"
                  name="tryOnCategory"
                  fullWidth
                  className="h-10! w-full! rounded-lg!"
                  inputClassName="h-10! w-full! rounded-lg! border-slate-200! bg-white! px-3! text-sm!"
                  placeholder="Chọn loại sản phẩm"
                  optionValue={TRY_ON_CATEGORY_OPTIONS}
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-11px font-bold text-slate-500">
                  Chọn màu sắc
                </Label>
                <div className="flex items-center gap-3">
                  {CATEGORY_COLOR_OPTIONS.map((option) => {
                    const active = values.color === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFieldValue("color", option.value)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer ${
                          active ? `ring-4 ${option.ringClassName}` : ""
                        } ${option.className}`}
                      >
                        {active && (
                          <Check className="size-4 text-white drop-shadow-[0_1px_2px_rgba(15,23,42,0.24)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-11px font-bold text-slate-500">
                  Biểu tượng
                </Label>
                <div className="grid grid-cols-6 gap-2.5">
                  {CATEGORY_ICON_OPTIONS.map((option) => (
                    <IconOption
                      key={option.value}
                      option={option}
                      active={values.icon === option.value}
                      onClick={() => setFieldValue("icon", option.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="adminPrimary"
                  className="h-10 w-full rounded-lg"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-1.25 h-3.5 w-3.5 animate-spin text-green-15" />
                  )}
                  {mode === "create" ? (
                    <>
                      {!isSubmitting && <PlusCircle className="size-4" />}
                      Tạo danh mục
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>

                {mode === "edit" && onDelete && (
                  <Button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    variant="adminDanger"
                    className="h-10 w-full rounded-lg"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-1.25 h-3.5 w-3.5 animate-spin text-red-4" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Xóa danh mục
                  </Button>
                )}

                <DialogClose
                  asChild
                  className="flex justify-items-center items-center w-full"
                >
                  <Button variant="close" type="button">
                    Đóng
                  </Button>
                </DialogClose>
              </div>
            </Form>
          </FormikProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
