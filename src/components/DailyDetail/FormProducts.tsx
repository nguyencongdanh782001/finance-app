"use client";

import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numberInput";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import { CustomInputProps, CustomSelectProps } from "@/interface/Field";
import { DailyDetailResponse } from "@/interface/financeAPI";
import { ProductApiItem } from "@/interface/product";
import {
  FieldArray,
  Form,
  FormikProvider,
  getIn,
  setIn,
  useFormik,
} from "formik";
import {
  AlertTriangle,
  Box,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Minus,
  PackageCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import * as Yup from "yup";

type InventoryProduct = {
  id: number;
  title: string;
  imageUrl: string;
  categoryName: string;
  importPrice: number;
  sellPrice: number;
  quantity: number;
};

type SaleEntryFormValue = {
  quantity: string;
  sellPrice: string;
};

type ProductSaleFormValue = {
  productId: string;
  sales: SaleEntryFormValue[];
};

type ProductSalesFormValues = {
  soldProducts: ProductSaleFormValue[];
};

const createDefaultSale = (): SaleEntryFormValue => ({
  quantity: "1",
  sellPrice: "",
});

const createDefaultRow = (): ProductSaleFormValue => ({
  productId: "",
  sales: [createDefaultSale()],
});

const validationSchema = Yup.object({
  soldProducts: Yup.array()
    .of(
      Yup.object({
        productId: Yup.string().required("Vui lòng chọn sản phẩm"),
        sales: Yup.array()
          .of(
            Yup.object({
              quantity: Yup.number()
                .typeError("Vui lòng nhập số lượng")
                .integer("Số lượng phải là số nguyên")
                .min(1, "Số lượng phải lớn hơn 0")
                .required("Vui lòng nhập số lượng"),
              sellPrice: Yup.number()
                .typeError("Vui lòng nhập giá bán")
                .min(0, "Giá bán không được âm")
                .required("Vui lòng nhập giá bán"),
            }),
          )
          .min(1, "Vui lòng nhập ít nhất một mức giá"),
      }),
    )
    .test(
      "unique-product",
      "Mỗi sản phẩm chỉ nên chọn một lần",
      (value = []) => {
        const selectedProductIds = value
          .map((item) => item.productId)
          .filter(Boolean);

        return selectedProductIds.length === new Set(selectedProductIds).size;
      },
    ),
});

interface FormProductsProps {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  reload: boolean;
  onReload: () => void;
}

const mapProductFromApi = (product: ProductApiItem): InventoryProduct => ({
  id: product.id,
  title: product.title,
  imageUrl: product.imageUrl,
  categoryName: product.category.name,
  importPrice: Number(product.importPrice),
  sellPrice: Number(product.sellPrice),
  quantity: product.quantity,
});

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}`;

const getFormikErrorsFromYup = async (values: ProductSalesFormValues) => {
  try {
    await validationSchema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.inner.reduce<Record<string, string>>((acc, currentError) => {
        if (currentError.path) {
          acc[currentError.path] = currentError.message;
        }

        return acc;
      }, {});
    }

    return {};
  }
};

function ProductImagePreview({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) {
  const [showImage, setShowImage] = useState(Boolean(imageUrl));

  useEffect(() => {
    setShowImage(Boolean(imageUrl));
  }, [imageUrl]);

  if (!showImage) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-slate-50 text-slate-400">
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 rounded-[14px] bg-slate-100 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="h-full w-full object-cover"
        onError={() => setShowImage(false)}
      />
    </div>
  );
}

const getRowQuantity = (sales: SaleEntryFormValue[]) =>
  sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);

export default function FormProducts(props: FormProductsProps) {
  const { data, isLoading, reload, onReload } = props;
  const params = useParams();
  const id = Number(params.id);
  const [inventoryProducts, setInventoryProducts] = useState<
    InventoryProduct[]
  >([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null,
  );
  const [collapsedProductIds, setCollapsedProductIds] = useState<string[]>([]);
  const savedImportPriceMap = useMemo(
    () =>
      new Map(
        (data?.soldProducts ?? []).map((item) => [
          item.productId,
          item.importPrice,
        ]),
      ),
    [data?.soldProducts],
  );

  const serverInitialValues = useMemo<ProductSalesFormValues>(
    () => ({
      soldProducts:
        data?.soldProducts.map((item) => ({
          productId: String(item.productId),
          sales: item.sales.map((sale) => ({
            quantity: String(sale.quantity),
            sellPrice: String(sale.sellPrice),
          })),
        })) ?? [],
    }),
    [data?.soldProducts],
  );
  const [stableInitialValues, setStableInitialValues] =
    useState<ProductSalesFormValues>(serverInitialValues);

  useEffect(() => {
    setStableInitialValues(serverInitialValues);
  }, [serverInitialValues]);

  const initialSoldProductMap = useMemo(
    () =>
      stableInitialValues.soldProducts.reduce((map, item) => {
        const productId = Number(item.productId);

        if (!productId) return map;

        map.set(
          productId,
          (map.get(productId) ?? 0) + getRowQuantity(item.sales),
        );
        return map;
      }, new Map<number, number>()),
    [stableInitialValues],
  );

  useEffect(() => {
    const fetchInventoryProducts = async () => {
      if (inventoryProducts.length === 0) {
        setIsInventoryLoading(true);
      }

      const res = await financeAPI.getProductList({
        page: 1,
        limit: 1000,
      });

      if (res.code === RESPONSE_CODES.success && res.data) {
        setInventoryProducts(res.data.data.map(mapProductFromApi));
      } else {
        toast({
          title: "Không tải được danh sách sản phẩm",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
      }

      setIsInventoryLoading(false);
    };

    fetchInventoryProducts();
  }, [reload, inventoryProducts.length]);

  const formik = useFormik<ProductSalesFormValues>({
    initialValues: stableInitialValues,
    enableReinitialize: true,
    validate: async (values) => {
      let nextErrors = await getFormikErrorsFromYup(values);

      values.soldProducts.forEach((item, index) => {
        if (!item.productId) return;

        const selectedProduct = inventoryProducts.find(
          (product) => String(product.id) === item.productId,
        );
        const initialQuantity =
          initialSoldProductMap.get(Number(item.productId)) ?? 0;
        const maxAvailable = selectedProduct
          ? selectedProduct.quantity + initialQuantity
          : 0;
        const totalQuantity = getRowQuantity(item.sales);

        if (totalQuantity > maxAvailable) {
          nextErrors = setIn(
            nextErrors,
            `soldProducts[${index}].sales`,
            `Tổng số lượng không được lớn hơn ${maxAvailable.toLocaleString("vi-VN")}`,
          );
        }
      });

      return nextErrors;
    },

    onSubmit: async (values, actions) => {
      const payload = values.soldProducts.map((item) => ({
        productId: Number(item.productId),
        sales: item.sales.map((sale) => ({
          quantity: Number(sale.quantity),
          sellPrice: Number(sale.sellPrice),
        })),
      }));

      const res = await financeAPI.putDailySoldProducts(id, {
        soldProducts: payload,
      });

      if (res.code === RESPONSE_CODES.success) {
        toast({
          title: "Cập nhật sản phẩm bán thành công",
          className: "bg-green-16 text-white text-sm font-medium w-fit",
          duration: 3500,
        });
        setStableInitialValues(values);
        actions.resetForm({ values });
        onReload();
        return;
      }

      const errorMessage =
        (res.data as { message?: string } | undefined)?.message ||
        "Vui lòng kiểm tra lại số lượng tồn kho rồi thử lại.";

      toast({
        title: errorMessage,
        className: "bg-red-1 text-white text-sm font-medium",
        duration: 3500,
      });
    },
  });

  const { values, isSubmitting, dirty, errors, submitForm, validateField } =
    formik;
  const hasPendingDraftRow = values.soldProducts.some(
    (item) => !item.productId,
  );

  const totalSoldCount = values.soldProducts.reduce(
    (sum, item) => sum + getRowQuantity(item.sales),
    0,
  );
  const totalEstimatedProfit = values.soldProducts.reduce((sum, item) => {
    const selectedProduct = inventoryProducts.find(
      (product) => String(product.id) === item.productId,
    );

    if (!selectedProduct) return sum;

    const effectiveImportPrice =
      savedImportPriceMap.get(Number(item.productId)) ??
      selectedProduct.importPrice;

    return (
      sum +
      item.sales.reduce((rowSum, sale) => {
        const quantity = Number(sale.quantity || 0);
        const unitSellPrice = Number(sale.sellPrice || 0);
        const unitProfit = unitSellPrice - effectiveImportPrice;

        return rowSum + unitProfit * quantity;
      }, 0)
    );
  }, 0);

  return (
    <FormikProvider value={formik}>
      <Form className="w-full flex flex-col rounded-2xl border border-gray-200 p-6 gap-y-5 bg-white shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-14 p-2">
              <PackageCheck className="size-4 text-green-13" />
            </div>
            <div>
              <p className="text-13px font-bold uppercase text-gray-3">
                Sản phẩm bán trong ngày
              </p>
            </div>
          </div>
        </div>

        {isLoading || isInventoryLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-26! w-full rounded-[24px]!" />
            <Skeleton className="h-26! w-full rounded-[24px]!" />
          </div>
        ) : (
          <FieldArray
            name="soldProducts"
            render={(arrayHelpers) => (
              <div className="space-y-4">
                {values.soldProducts.length > 0 ? (
                  values.soldProducts.map((item, index) => {
                    const selectedProduct = inventoryProducts.find(
                      (product) => String(product.id) === item.productId,
                    );
                    const selectedIds = values.soldProducts
                      .map((row) => row.productId)
                      .filter(
                        (productId, rowIndex) =>
                          productId && rowIndex !== index,
                      );
                    const initialQuantity = item.productId
                      ? (initialSoldProductMap.get(Number(item.productId)) ?? 0)
                      : 0;
                    const effectiveImportPrice =
                      savedImportPriceMap.get(Number(item.productId)) ??
                      selectedProduct?.importPrice ??
                      0;
                    const maxAvailable = selectedProduct
                      ? selectedProduct.quantity + initialQuantity
                      : 0;
                    const isSavedProduct = item.productId
                      ? initialSoldProductMap.has(Number(item.productId))
                      : false;
                    const isOutOfStock = Boolean(
                      selectedProduct && maxAvailable === 0,
                    );
                    const isCollapsed = item.productId
                      ? collapsedProductIds.includes(item.productId)
                      : false;

                    const optionValue = inventoryProducts.map((product) => ({
                      label:
                        product.quantity === 0
                          ? `${product.title} • ${product.categoryName} • Hết hàng`
                          : `${product.title} • ${product.categoryName}`,
                      value: String(product.id),
                      disabled:
                        selectedIds.includes(String(product.id)) ||
                        (product.quantity === 0 &&
                          !initialSoldProductMap.has(product.id)),
                    }));

                    return (
                      <div
                        key={`${item.productId || "new"}-${index}`}
                        className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-3 shadow-[0_10px_24px_rgba(148,163,184,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-13px font-bold uppercase tracking-[0.06em] text-slate-500">
                              Sản phẩm #{index + 1}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-9 w-9 rounded-full bg-white text-rose-400 hover:bg-rose-50 hover:text-rose-500"
                            onClick={() => setDeleteTargetIndex(index)}
                            disabled={isSubmitting || isLoading || reload}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2.5">
                          <div className="flex flex-col gap-2">
                            <Label
                              variant="secondary"
                              className="text-green-1! text-11px font-bold"
                            >
                              Tên sản phẩm
                            </Label>
                            <AutoCompleteField<CustomSelectProps>
                              component={CustomSelect}
                              version="field"
                              name={`soldProducts[${index}].productId`}
                              placeholder="Chọn sản phẩm đã bán"
                              optionValue={optionValue}
                              className="h-12! w-full! min-w-full!"
                              inputClassName="!h-12 !rounded-xl !bg-white"
                              searchable
                              popoverTrgVariant={{
                                variant: "search-box--lgray",
                              }}
                              onManualSelect={(v) => {
                                const nextProduct = inventoryProducts.find(
                                  (product) => String(product.id) === v,
                                );

                                formik.setFieldValue(
                                  `soldProducts[${index}].sales[0].sellPrice`,
                                  nextProduct
                                    ? String(nextProduct.sellPrice)
                                    : "",
                                );

                                setTimeout(() => {
                                  if (v) {
                                    void submitForm();
                                  }
                                }, 0);
                              }}
                              disabled={
                                isSubmitting ||
                                isLoading ||
                                reload ||
                                isSavedProduct
                              }
                            />
                          </div>
                        </div>

                        {selectedProduct ? (
                          <div className="mt-3 flex flex-col gap-2.5 rounded-[16px] bg-white p-2.5">
                            <div className="flex w-full items-start justify-between gap-2">
                              <div className="flex gap-2 w-full">
                                <ProductImagePreview
                                  imageUrl={selectedProduct.imageUrl}
                                  title={selectedProduct.title}
                                />
                                <div className="flex flex-col w-full">
                                  <p className="line-clamp-1 text-sm font-extrabold text-slate-700">
                                    {selectedProduct.title}
                                  </p>
                                  <p className="mt-1 text-10px font-bold uppercase tracking-[0.08em] text-slate-300">
                                    {selectedProduct.categoryName}
                                  </p>
                                  {isOutOfStock ? (
                                    <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-10px font-bold uppercase tracking-[0.08em] text-rose-600">
                                      <AlertTriangle className="size-3.5" />
                                      Hết hàng
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="h-9 w-9 shrink-0 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                onClick={() => {
                                  if (!item.productId) return;

                                  setCollapsedProductIds((prev) =>
                                    prev.includes(item.productId)
                                      ? prev.filter(
                                          (productId) =>
                                            productId !== item.productId,
                                        )
                                      : [...prev, item.productId],
                                  );
                                }}
                              >
                                {isCollapsed ? (
                                  <ChevronDown className="size-4" />
                                ) : (
                                  <ChevronUp className="size-4" />
                                )}
                              </Button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mt-2 grid grid-cols-3 gap-1.5 text-11px">
                                <div className="rounded-xl bg-slate-50 px-2 py-1.5">
                                  <p className="font-bold text-slate-400">
                                    Giá bán
                                  </p>
                                  <p className="mt-0.5 font-extrabold text-slate-700">
                                    {formatCurrency(selectedProduct.sellPrice)}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-2 py-1.5">
                                  <p className="font-bold text-slate-400">
                                    Giá nhập
                                  </p>
                                  <p className="mt-0.5 font-extrabold text-slate-700">
                                    {formatCurrency(effectiveImportPrice)}
                                  </p>
                                </div>
                                <div
                                  className={`rounded-xl px-2 py-1.5 ${
                                    isOutOfStock ? "bg-rose-50" : "bg-slate-50"
                                  }`}
                                >
                                  <p className="font-bold text-slate-400">
                                    Trong kho
                                  </p>
                                  <p
                                    className={`mt-0.5 font-extrabold ${
                                      isOutOfStock
                                        ? "text-rose-500"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {selectedProduct.quantity.toLocaleString(
                                      "vi-VN",
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* <p className="mt-2 text-11px text-slate-400">
                                Khả dụng cho ngày này:{" "}
                                <span className="font-semibold text-slate-600">
                                  {maxAvailable.toLocaleString("vi-VN")}
                                </span>
                              </p> */}

                              {!isCollapsed ? (
                                <FieldArray
                                  name={`soldProducts[${index}].sales`}
                                  render={(salesHelpers) => (
                                    <div className="mt-3 space-y-2.5">
                                      {item.sales.map((sale, saleIndex) => {
                                        const currentQuantity = Number(
                                          sale.quantity || 0,
                                        );
                                        const totalOtherQuantity =
                                          getRowQuantity(item.sales) -
                                          currentQuantity;
                                        const maxAvailableForSale = Math.max(
                                          maxAvailable - totalOtherQuantity,
                                          0,
                                        );

                                        return (
                                          <div
                                            key={`sale-${index}-${saleIndex}`}
                                            className="rounded-xl bg-slate-50 px-2 py-2"
                                          >
                                            <div className="mb-2 flex items-center justify-between">
                                              <p className="text-11px font-bold text-slate-500">
                                                Mức giá #{saleIndex + 1}
                                              </p>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="h-8 w-8 rounded-full bg-white text-rose-400 hover:bg-rose-50 hover:text-rose-500"
                                                onClick={() => {
                                                  if (item.sales.length === 1) {
                                                    arrayHelpers.remove(index);
                                                  } else {
                                                    salesHelpers.remove(
                                                      saleIndex,
                                                    );
                                                  }
                                                  setTimeout(() => {
                                                    void submitForm();
                                                  }, 0);
                                                }}
                                                disabled={
                                                  isSubmitting ||
                                                  isLoading ||
                                                  reload
                                                }
                                              >
                                                <Trash2 className="size-4" />
                                              </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                              <div className="flex flex-col gap-2 w-full">
                                                <Label
                                                  variant="secondary"
                                                  className="text-green-1! text-11px font-bold"
                                                >
                                                  Số lượng đã bán
                                                </Label>
                                                <div className="flex items-start gap-2">
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="mt-0.5 h-12 w-12 shrink-0 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                                    disabled={
                                                      isSubmitting ||
                                                      isLoading ||
                                                      reload ||
                                                      currentQuantity <= 1
                                                    }
                                                    onClick={() => {
                                                      const nextQuantity =
                                                        String(
                                                          Math.max(
                                                            currentQuantity - 1,
                                                            1,
                                                          ),
                                                        );

                                                      formik.setFieldValue(
                                                        `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                        nextQuantity,
                                                      );
                                                      formik.setFieldTouched(
                                                        `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                        true,
                                                        false,
                                                      );
                                                      void validateField(
                                                        `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                      );
                                                      setTimeout(() => {
                                                        void submitForm();
                                                      }, 0);
                                                    }}
                                                  >
                                                    <Minus className="size-4" />
                                                  </Button>

                                                  <div className="flex flex-col w-full flex-1">
                                                    <AutoCompleteField<CustomInputProps>
                                                      component={NumericInput}
                                                      version="field"
                                                      name={`soldProducts[${index}].sales[${saleIndex}].quantity`}
                                                      placeholder="0"
                                                      className="text-11px! bg-white! h-12! rounded-xl! border-slate-100 min-w-full! max-w-32 py-2 pl-3 text-sm text-gray-17 border font-normal !placeholder:font-normal"
                                                      pattern="^\d+(\.\d*)?$"
                                                      disabled={
                                                        isSubmitting ||
                                                        isLoading ||
                                                        reload
                                                      }
                                                      onBlur={() => {
                                                        if (!dirty) return;
                                                        formik.setFieldTouched(
                                                          `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                          true,
                                                        );
                                                        void validateField(
                                                          `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                        );
                                                        setTimeout(() => {
                                                          void submitForm();
                                                        }, 0);
                                                      }}
                                                    />
                                                  </div>

                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="mt-0.5 h-12 w-12 shrink-0 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                                    disabled={
                                                      isSubmitting ||
                                                      isLoading ||
                                                      reload ||
                                                      currentQuantity >=
                                                        maxAvailableForSale
                                                    }
                                                    onClick={() => {
                                                      const nextQuantity =
                                                        String(
                                                          Math.min(
                                                            currentQuantity + 1,
                                                            maxAvailableForSale,
                                                          ),
                                                        );

                                                      formik.setFieldValue(
                                                        `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                        nextQuantity,
                                                      );
                                                      formik.setFieldTouched(
                                                        `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                        true,
                                                        false,
                                                      );
                                                      void validateField(
                                                        `soldProducts[${index}].sales[${saleIndex}].quantity`,
                                                      );
                                                      setTimeout(() => {
                                                        void submitForm();
                                                      }, 0);
                                                    }}
                                                  >
                                                    <Plus className="size-4" />
                                                  </Button>
                                                </div>
                                              </div>

                                              <div className="flex flex-col gap-2 w-full">
                                                <Label
                                                  variant="secondary"
                                                  className="text-green-1! text-11px font-bold"
                                                >
                                                  Giá bán thực tế
                                                </Label>
                                                <AutoCompleteField<CustomInputProps>
                                                  component={NumericInput}
                                                  version="field"
                                                  name={`soldProducts[${index}].sales[${saleIndex}].sellPrice`}
                                                  placeholder="0"
                                                  className="text-11px! bg-white! h-12! rounded-xl! border-slate-100 min-w-full! py-2 pl-3 text-sm text-gray-17 border font-normal !placeholder:font-normal"
                                                  pattern="^\d+(\.\d*)?$"
                                                  disabled={
                                                    isSubmitting ||
                                                    isLoading ||
                                                    reload
                                                  }
                                                  onBlur={() => {
                                                    if (!dirty) return;
                                                    formik.setFieldTouched(
                                                      `soldProducts[${index}].sales[${saleIndex}].sellPrice`,
                                                      true,
                                                    );
                                                    void validateField(
                                                      `soldProducts[${index}].sales[${saleIndex}].sellPrice`,
                                                    );
                                                    setTimeout(() => {
                                                      void submitForm();
                                                    }, 0);
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-11 w-full rounded-2xl border border-dashed border-green-15 bg-green-14 text-sm font-semibold text-green-13 hover:bg-green-14"
                                        onClick={() =>
                                          salesHelpers.push({
                                            quantity: "1",
                                            sellPrice: String(
                                              selectedProduct.sellPrice,
                                            ),
                                          })
                                        }
                                        disabled={
                                          isSubmitting || isLoading || reload
                                        }
                                      >
                                        <Plus className="size-4" />
                                        Thêm mức giá
                                      </Button>
                                    </div>
                                  )}
                                />
                              ) : null}

                              {typeof getIn(
                                errors,
                                `soldProducts[${index}].sales`,
                              ) === "string" ? (
                                <p className="mt-2 text-red-1 text-sm">
                                  {String(
                                    getIn(
                                      errors,
                                      `soldProducts[${index}].sales`,
                                    ),
                                  )}
                                </p>
                              ) : null}

                              {isOutOfStock ? (
                                <p className="mt-2 flex items-center gap-1.5 text-11px font-semibold text-rose-500">
                                  <AlertTriangle className="size-3.5" />
                                  Sản phẩm này đã hết hàng và không thể thêm mới
                                  vào danh sách bán.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 rounded-[20px] border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-400">
                            <Box className="size-4" />
                            Chọn sản phẩm để xem nhanh tồn kho và giá bán.
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <PackageCheck className="size-5 text-slate-400" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-600">
                      Hôm nay chưa ghi nhận sản phẩm nào
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Thêm sản phẩm đã bán để theo dõi số lượng và tồn kho ngay
                      tại đây.
                    </p>
                  </div>
                )}

                {typeof errors.soldProducts === "string" ? (
                  <p className="text-red-1 text-sm">{errors.soldProducts}</p>
                ) : null}

                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 w-full rounded-3xl border border-dashed border-green-15 bg-green-14 text-sm font-semibold text-green-13 hover:bg-green-14"
                  onClick={() => arrayHelpers.push(createDefaultRow())}
                  disabled={
                    isSubmitting ||
                    isLoading ||
                    reload ||
                    inventoryProducts.length === 0 ||
                    hasPendingDraftRow
                  }
                >
                  <Plus className="size-4" />
                  Thêm sản phẩm đã bán
                </Button>

                <Dialog
                  open={deleteTargetIndex !== null}
                  onOpenChange={(open) => {
                    if (!open) {
                      setDeleteTargetIndex(null);
                    }
                  }}
                >
                  <DialogContent className="w-[calc(100%-24px)] max-w-102.5 overflow-hidden rounded-[32px] border-none bg-transparent p-0 shadow-none">
                    <div className="rounded-[32px] bg-white px-6 py-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
                      <DialogTitle className="text-13px font-extrabold uppercase text-gray-3">
                        Xác nhận xóa
                      </DialogTitle>
                      <DialogDescription className="mx-auto mt-4 max-w-64 text-sm leading-7 text-slate-400">
                        Bạn có chắc chắn muốn xóa sản phẩm đã bán này?
                      </DialogDescription>

                      <div className="mt-8 space-y-3">
                        <Button
                          type="button"
                          className="h-14 w-full rounded-3xl bg-red-6 text-sm font-semibold text-red-4 hover:bg-red-5"
                          onClick={() => {
                            if (deleteTargetIndex === null) return;

                            arrayHelpers.remove(deleteTargetIndex);
                            setDeleteTargetIndex(null);
                            setTimeout(() => {
                              void submitForm();
                            }, 0);
                          }}
                        >
                          Xóa
                        </Button>
                        <DialogClose asChild>
                          <Button type="button" variant="close">
                            Đóng
                          </Button>
                        </DialogClose>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          />
        )}

        <button disabled={!dirty} type="submit" className="hidden" />

        {!isLoading && !isInventoryLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-green-100 bg-linear-to-br from-green-14 to-white px-4 py-3.5 shadow-[0_10px_30px_rgba(22,163,74,0.08)]">
              <p className="text-10px font-bold uppercase tracking-[0.08em] text-green-1">
                Tổng số lượng
              </p>
              <p className="mt-2 text-2xl font-black leading-none text-green-13">
                {totalSoldCount.toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Sản phẩm đã bán hôm nay
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(100,116,139,0.1)]">
              <p className="text-10px font-bold uppercase tracking-[0.08em] text-slate-500">
                Lợi nhuận dự kiến
              </p>
              <p
                className={`mt-2 text-2xl font-black leading-none ${totalEstimatedProfit < 0 ? "text-red-1" : "text-green-13"}`}
              >
                {formatCurrency(totalEstimatedProfit)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tạm tính theo giá vốn và giá bán thực tế
              </p>
            </div>
          </div>
        ) : null}
      </Form>
    </FormikProvider>
  );
}
