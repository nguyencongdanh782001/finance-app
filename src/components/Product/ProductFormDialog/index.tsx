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
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import { toast } from "@/hook/use-toast";
import { CategoryItemData } from "@/interface/category";
import { CustomInputProps, CustomSelectProps } from "@/interface/Field";
import { ProductFormValues } from "@/interface/product";
import { isHeicLikeFile } from "@/lib/image-file";
import {
  ImagePlus,
  Loader2,
  PlusCircle,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const validationSchema = Yup.object({
  title: Yup.string().trim().required("Vui lòng nhập tên sản phẩm"),
  categoryId: Yup.string().required("Vui lòng chọn danh mục"),
  importPrice: Yup.string().required("Vui lòng nhập giá nhập"),
  sellPrice: Yup.string().required("Vui lòng nhập giá bán"),
  quantity: Yup.string().required("Vui lòng nhập số lượng"),
});

interface ProductFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  categories: CategoryItemData[];
  initialValues: ProductFormValues;
  initialImageUrl?: string;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: ProductFormValues,
    imageFile?: File | null,
  ) => Promise<boolean> | boolean;
  onDelete?: () => void;
}

export default function ProductFormDialog({
  open,
  mode,
  categories,
  initialValues,
  initialImageUrl,
  isDeleting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: ProductFormDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl || "");
  const [isConvertingImage, setIsConvertingImage] = useState(false);

  useEffect(() => {
    setSelectedFile(null);
    setPreviewUrl(initialImageUrl || "");
  }, [initialImageUrl, open]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, actions) => {
      actions.setSubmitting(true);
      const isSuccess = await onSubmit(
        {
          ...values,
          title: values.title.trim(),
        },
        selectedFile,
      );
      actions.setSubmitting(false);

      if (isSuccess) {
        actions.resetForm();
        setSelectedFile(null);
        setPreviewUrl("");
      }
    },
  });

  const { isSubmitting } = formik;
  const categoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  const convertHeicToJpeg = async (file: File) => {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const nextFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");

    return new File([blob], nextFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  const handlePickImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsConvertingImage(true);
      const nextFile = isHeicLikeFile(file)
        ? await convertHeicToJpeg(file)
        : file;

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
    } catch {
      toast({
        title: "Không thể chuyển ảnh HEIC",
        description: "Vui lòng chọn ảnh khác hoặc thử lại.",
        className: "bg-red-1 text-white text-sm font-medium",
        duration: 3500,
      });
      setSelectedFile(null);
      setPreviewUrl(initialImageUrl || "");
    } finally {
      setIsConvertingImage(false);
      event.target.value = "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          formik.resetForm();
          setSelectedFile(null);
          setPreviewUrl(initialImageUrl || "");
          setIsConvertingImage(false);
        }
      }}
    >
      <DialogContent className="w-[calc(100%-24px)] max-w-107.5 overflow-hidden border-none bg-transparent p-0 shadow-none">
        <Card className="flex max-h-[88svh] flex-col gap-0 overflow-hidden border-none bg-white py-0 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <CardContent className="flex min-h-0 flex-1 flex-col px-0 py-0">
            <FormikProvider value={formik}>
              <Form className="flex min-h-0 flex-1 flex-col">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
                  <DialogTitle className="text-13px font-extrabold uppercase text-gray-3">
                    {mode === "create"
                      ? "Thêm sản phẩm mới"
                      : "Chỉnh sửa sản phẩm"}
                  </DialogTitle>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-11px font-bold text-slate-500">
                        Hình ảnh sản phẩm
                      </Label>
                      <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                        {previewUrl ? (
                          <div className="space-y-4">
                            <div className="mx-auto h-44 w-44 overflow-hidden rounded-[18px] bg-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => inputRef.current?.click()}
                              className="h-10 rounded-full bg-green-18 px-4 text-sm font-semibold text-green-15 hover:bg-green-14"
                            >
                              <RefreshCcw className="size-4" />
                              Thay đổi ảnh
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 py-5">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-18 text-green-15">
                              {isConvertingImage ? (
                                <Loader2 className="size-6 animate-spin" />
                              ) : (
                                <ImagePlus className="size-6" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                Thêm ảnh sản phẩm
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                PNG, JPG, HEIC tối đa 5MB. Ảnh HEIC sẽ được
                                chuyển sang JPG tự động.
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={() => inputRef.current?.click()}
                              disabled={isConvertingImage}
                              className="h-10 rounded-full bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                            >
                              Chọn tệp
                            </Button>
                          </div>
                        )}

                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*,.heic,.heif"
                          className="hidden"
                          onChange={handlePickImage}
                          disabled={isConvertingImage}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-11px font-bold text-slate-500">
                        Tên sản phẩm
                      </Label>
                      <AutoCompleteField<CustomInputProps>
                        component={Input}
                        version="field"
                        name="title"
                        placeholder="Ví dụ: Áo sơ mi linen"
                        className="h-12 rounded-[14px]! border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-11px font-bold text-slate-500">
                        Danh mục
                      </Label>
                      <AutoCompleteField<CustomSelectProps>
                        component={CustomSelect}
                        version="field"
                        name="categoryId"
                        placeholder="Chọn danh mục sản phẩm"
                        optionValue={categoryOptions}
                        className="h-12! w-full! min-w-full! rounded-[14px]! text-sm font-medium text-slate-700"
                        inputClassName="text-sm font-medium text-slate-700"
                        popoverTrgVariant={{ variant: "search-box--lgray" }}
                        searchable
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-11px font-bold text-slate-500">
                          Giá nhập
                        </Label>
                        <AutoCompleteField<CustomInputProps>
                          component={NumericInput}
                          version="field"
                          name="importPrice"
                          placeholder="0"
                          className="h-12 rounded-[14px]! border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-11px font-bold text-slate-500">
                          Giá bán
                        </Label>
                        <AutoCompleteField<CustomInputProps>
                          component={NumericInput}
                          version="field"
                          name="sellPrice"
                          placeholder="0"
                          className="h-12 rounded-[14px]! border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-11px font-bold text-slate-500">
                        Số lượng tồn kho
                      </Label>
                      <AutoCompleteField<CustomInputProps>
                        component={NumericInput}
                        version="field"
                        name="quantity"
                        placeholder="1"
                        className="h-12 rounded-[14px]! border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 space-y-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isConvertingImage}
                    className="h-12 w-full rounded-3xl bg-green-16 text-sm font-bold text-white hover:bg-green-15"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-1.25 h-3.5 w-3.5 animate-spin text-white" />
                    )}
                    {mode === "create" ? (
                      <>
                        {!isSubmitting && <PlusCircle className="size-4" />}
                        Tạo sản phẩm
                      </>
                    ) : (
                      "Cập nhật sản phẩm"
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
                      Xóa sản phẩm
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
