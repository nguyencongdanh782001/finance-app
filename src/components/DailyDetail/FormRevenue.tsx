"use client";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import { CustomInputProps } from "@/interface/Field";
import {
  DailyDetailResponse,
  UpdateDailyRequest,
} from "@/interface/financeAPI";
import { Form, FormikProvider, useFormik } from "formik";
import { debounce } from "lodash";
import { CandlestickChartIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import AutoCompleteField from "../common/CustomFields/AutoCompleteField";
import { Label } from "../ui/label";
import { NumericInput } from "../ui/numberInput";
import { Skeleton } from "../ui/skeleton";

interface FormRevenueProps {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  onReload: () => void;
  reload: boolean;
}

export default function FormRevenue(props: FormRevenueProps) {
  const { data, isLoading, reload, onReload } = props;
  const params = useParams();

  const id = Number(params.id);

  const initialValues: Pick<UpdateDailyRequest, "revenueBank" | "revenueCash"> =
    {
      revenueBank: data?.revenueBank || "",
      revenueCash: data?.revenueCash || "",
    };

  const fuzzySubmit = useCallback(
    debounce(
      async (
        value: Pick<UpdateDailyRequest, "revenueBank" | "revenueCash">,
        setSubmitting: (isSubmitting: boolean) => void,
      ) => {
        setSubmitting(true);
        const res = await financeAPI.putDailyDetailData(id, {
          revenueBank: Number(value.revenueBank || 0),
          revenueCash: Number(value.revenueCash || 0),
        });

        if (res.code === RESPONSE_CODES.success) {
          onReload();
        } else {
          toast({
            title: "Cập nhật vốn hoá thất bại",
            className: "bg-red-1 text-white text-sm font-medium w-fit",
            duration: 3000,
          });
        }
        setSubmitting(false);
      },
      500,
    ),
    [data],
  );

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    onSubmit: async (value, action) => {
      await fuzzySubmit(value, action.setSubmitting);
    },
  });

  const { isSubmitting, submitForm, dirty } = formik;

  return (
    <FormikProvider value={formik}>
      <Form className="w-full flex flex-col rounded-2xl border border-gray-200 p-6 gap-y-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-2">
            <CandlestickChartIcon className="size-4 text-purple-1" />
          </div>
          <p className="text-13px text-gray-2 font-bold uppercase">
            Chốt Doanh Thu
          </p>
        </div>

        {/* Vốn tiền mặt */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-green-1! text-11px font-bold"
          >
            Tổng tiền mặt
          </Label>
          {isLoading ? (
            <Skeleton className="h-14! w-full  rounded-xl! bg-gray-300" />
          ) : (
            <AutoCompleteField<CustomInputProps>
              component={NumericInput}
              version="field"
              placeholder="0"
              name="revenueCash"
              variant="default"
              className="bg-purple-2! h-14! rounded-xl! border-purple-3! w-full py-2.5 pl-3.5 text-sm text-gray-17 border font-normal !placeholder:font-normal"
              pattern="^\d+(\.\d*)?$"
              disabled={isSubmitting || isLoading || reload}
              onBlur={() => {
                if (dirty) submitForm();
              }}
            />
          )}
        </div>

        {/* Vốn chuyển khoản */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-green-1! text-11px font-bold"
          >
            Tổng chuyển khoản
          </Label>
          {isLoading ? (
            <Skeleton className="h-14! w-full  rounded-xl! bg-gray-300" />
          ) : (
            <AutoCompleteField<CustomInputProps>
              component={NumericInput}
              version="field"
              placeholder="0"
              name="revenueBank"
              variant="default"
              className="bg-blue-3! h-14! rounded-xl! border-blue-4! w-full py-2.5 pl-3.5 text-sm text-gray-17 border font-normal !placeholder:font-normal"
              pattern="^\d+(\.\d*)?$"
              disabled={isSubmitting || isLoading || reload}
              onBlur={() => {
                if (dirty) submitForm();
              }}
            />
          )}
        </div>
        <button disabled={!dirty} type="submit" className="hidden" />
      </Form>
    </FormikProvider>
  );
}
