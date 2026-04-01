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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from "@/components/Category/constants";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoryFormValues, CategoryIconOption } from "@/interface/category";
import { CustomInputProps, CustomTextAreaProps } from "@/interface/Field";
import { Check, Loader2, PlusCircle, Trash2 } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Vui lòng nhập tên danh mục")
    .max(40, "Tên danh mục tối đa 40 ký tự"),
  description: Yup.string()
    .trim()
    .required("Vui lòng nhập mô tả")
    .max(120, "Mô tả tối đa 120 ký tự"),
  color: Yup.string().required("Vui lòng chọn màu"),
  icon: Yup.string().required("Vui lòng chọn biểu tượng"),
});

interface CategoryFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: CategoryFormValues;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
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
          ? "border-green-16 bg-green-16 text-white shadow-[0_12px_24px_rgba(52,211,153,0.28)]"
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
      await onSubmit({
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
      });
      actions.setSubmitting(false);
      actions.resetForm({ values });
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
      <DialogContent className="w-[calc(100%-24px)] max-w-107.5 overflow-hidden rounded-[32px] border-none bg-transparent p-0 shadow-none">
        <Card className="gap-0 rounded-[32px] border-none bg-white py-0 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <CardContent className="px-5 py-6 sm:px-6">
            <FormikProvider value={formik}>
              <Form className="space-y-5">
                <div className="text-center">
                  <DialogTitle className="text-13px font-extrabold uppercase text-gray-3">
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
                    className="h-12 rounded-[14px]! border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300"
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
                    className="h-12 w-full rounded-3xl bg-green-17 text-sm font-bold text-green-15 hover:bg-green-17/90"
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
                      className="h-12 w-full rounded-3xl bg-red-6 text-sm font-semibold text-red-4 hover:bg-red-5"
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
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
