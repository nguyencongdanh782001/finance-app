"use client";

import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numberInput";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import { CustomInputProps, CustomSelectProps } from "@/interface/Field";
import { DailyDetailResponse } from "@/interface/financeAPI";
import { ProductApiItem } from "@/interface/product";
import { FieldArray, Form, FormikProvider, useFormik } from "formik";
import {
  AlertTriangle,
  Box,
  ImageOff,
  Loader2,
  PackageCheck,
  Plus,
  Save,
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

type ProductSaleFormValue = {
  productId: string;
  quantity: string;
};

type ProductSalesFormValues = {
  soldProducts: ProductSaleFormValue[];
};

const DEFAULT_ROW: ProductSaleFormValue = {
  productId: "",
  quantity: "1",
};

const validationSchema = Yup.object({
  soldProducts: Yup.array()
    .of(
      Yup.object({
        productId: Yup.string().required("Vui lòng chọn sản phẩm"),
        quantity: Yup.number()
          .typeError("Vui lòng nhập số lượng")
          .integer("Số lượng phải là số nguyên")
          .min(1, "Số lượng phải lớn hơn 0")
          .required("Vui lòng nhập số lượng"),
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

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

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

export default function FormProducts(props: FormProductsProps) {
  const { data, isLoading, reload, onReload } = props;
  const params = useParams();
  const id = Number(params.id);
  const [inventoryProducts, setInventoryProducts] = useState<
    InventoryProduct[]
  >([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);

  const initialSoldProductMap = useMemo(
    () =>
      new Map(
        (data?.soldProducts ?? []).map((item) => [
          item.productId,
          item.quantity,
        ]),
      ),
    [data?.soldProducts],
  );

  const initialValues: ProductSalesFormValues = {
    soldProducts:
      data?.soldProducts.map((item) => ({
        productId: String(item.productId),
        quantity: String(item.quantity),
      })) ?? [],
  };

  useEffect(() => {
    const fetchInventoryProducts = async () => {
      setIsInventoryLoading(true);

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
  }, []);

  const formik = useFormik<ProductSalesFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, actions) => {
      const payload = values.soldProducts.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }));

      const res = await financeAPI.putDailySoldProducts(id, {
        soldProducts: payload,
      });

      if (res.code === RESPONSE_CODES.success) {
        const savedProfit = res.data?.summary?.totalProfit ?? 0;

        toast({
          title: "Đã cập nhật sản phẩm bán trong ngày",
          description: `Tổng lợi nhuận theo sản phẩm hôm nay: ${formatCurrency(savedProfit)}`,
          className: "bg-green-16 text-white text-sm font-medium w-fit",
          duration: 3500,
        });
        actions.resetForm({ values });
        onReload();
        return;
      }

      const errorMessage =
        (res.data as { message?: string } | undefined)?.message ||
        "Vui lòng kiểm tra lại số lượng tồn kho rồi thử lại.";

      toast({
        title: "Cập nhật sản phẩm bán thất bại",
        description: errorMessage,
        className: "bg-red-1 text-white text-sm font-medium",
        duration: 3500,
      });
    },
  });

  const { values, isSubmitting, dirty, errors } = formik;

  const totalSoldCount = values.soldProducts.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const totalEstimatedProfit = values.soldProducts.reduce((sum, item) => {
    const selectedProduct = inventoryProducts.find(
      (product) => String(product.id) === item.productId,
    );

    if (!selectedProduct) return sum;

    const quantity = Number(item.quantity || 0);
    const unitProfit = selectedProduct.sellPrice - selectedProduct.importPrice;

    return sum + unitProfit * quantity;
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
                Tạm tính theo giá vốn và giá bán
              </p>
            </div>
          </div>
        </div>

        {isLoading || isInventoryLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-26! w-full rounded-[24px]! bg-gray-300" />
            <Skeleton className="h-26! w-full rounded-[24px]! bg-gray-300" />
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
                    const maxAvailable = selectedProduct
                      ? selectedProduct.quantity + initialQuantity
                      : 0;
                    const previewRemaining =
                      selectedProduct && item.quantity
                        ? Math.max(maxAvailable - Number(item.quantity || 0), 0)
                        : (selectedProduct?.quantity ?? 0);
                    const isSavedProduct = item.productId
                      ? initialSoldProductMap.has(Number(item.productId))
                      : false;
                    const isOutOfStock = Boolean(
                      selectedProduct && maxAvailable === 0,
                    );

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
                            onClick={() => arrayHelpers.remove(index)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_104px] gap-2.5">
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
                              disabled={
                                isSubmitting || reload || isSavedProduct
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label
                              variant="secondary"
                              className="text-green-1! text-11px font-bold"
                            >
                              Số lượng đã bán
                            </Label>
                            <AutoCompleteField<CustomInputProps>
                              component={NumericInput}
                              version="field"
                              name={`soldProducts[${index}].quantity`}
                              placeholder="0"
                              className="bg-white! h-12! rounded-xl! border-slate-100! w-full py-2 pl-3 text-sm text-gray-17 border font-normal !placeholder:font-normal"
                              pattern="^\\d+$"
                              disabled={isSubmitting || reload}
                            />
                          </div>
                        </div>

                        {selectedProduct ? (
                          <div className="mt-3 flex flex-col gap-2.5 rounded-[16px] bg-white p-2.5">
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
                                  <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-rose-600">
                                    <AlertTriangle className="size-3.5" />
                                    Hết hàng
                                  </div>
                                ) : null}
                              </div>
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
                                <div
                                  className={`rounded-xl px-2 py-1.5 ${
                                    isOutOfStock
                                      ? "bg-rose-50"
                                      : "bg-slate-50"
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
                                <div className="rounded-xl bg-green-14 px-2 py-1.5">
                                  <p className="font-bold text-green-1">
                                    Sau lưu
                                  </p>
                                  <p className="mt-0.5 font-extrabold text-green-13">
                                    {previewRemaining.toLocaleString("vi-VN")}
                                  </p>
                                </div>
                              </div>

                              <p className="mt-2 text-11px text-slate-400">
                                Khả dụng cho ngày này:{" "}
                                <span className="font-semibold text-slate-600">
                                  {maxAvailable.toLocaleString("vi-VN")}
                                </span>
                              </p>
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
                  onClick={() => arrayHelpers.push(DEFAULT_ROW)}
                  disabled={
                    isSubmitting || reload || inventoryProducts.length === 0
                  }
                >
                  <Plus className="size-4" />
                  Thêm sản phẩm đã bán
                </Button>
              </div>
            )}
          />
        )}

        {!isLoading && !isInventoryLoading ? (
          <div className="flex flex-col rounded-[24px] bg-slate-50 px-4 py-4 w-full">
            <Button
              type="submit"
              className="h-12 rounded-3xl bg-green-16 px-6 text-sm font-semibold text-white hover:bg-green-16/90"
              disabled={isSubmitting || reload || isInventoryLoading || !dirty}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-3.5 h-3.5 text-white mr-1.25" />
              ) : (
                <Save className="size-4" />
              )}
              Lưu danh sách sản phẩm
            </Button>
          </div>
        ) : null}
      </Form>
    </FormikProvider>
  );
}
