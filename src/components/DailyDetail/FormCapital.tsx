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
import { WalletIcon } from "lucide-react";
import { useParams } from "next/navigation";
import AutoCompleteField from "../common/CustomFields/AutoCompleteField";
import { Label } from "../ui/label";
import { NumericInput } from "../ui/numberInput";
import { Skeleton } from "../ui/skeleton";

interface FormCapitalProps {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  reload: boolean;
  onReload: () => void;
}

export default function FormCapital(props: FormCapitalProps) {
  const { data, isLoading, reload, onReload } = props;
  const params = useParams();

  const id = Number(params.id);
  const initialValues: Pick<UpdateDailyRequest, "capitalBank" | "capitalCash"> =
    {
      capitalBank: data?.capitalBank || "",
      capitalCash: data?.capitalCash || "",
    };

  const fuzzySubmit = async (
    value: Pick<UpdateDailyRequest, "capitalBank" | "capitalCash">,
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    setSubmitting(true);
    const res = await financeAPI.putDailyDetailData(id, {
      capitalBank: Number(value.capitalBank || 0),
      capitalCash: Number(value.capitalCash || 0),
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
  };

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
      <Form className="flex w-full flex-col gap-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <WalletIcon className="size-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Tiền vốn đầu ngày
          </p>
        </div>

        {/* Vốn tiền mặt */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-xs font-medium text-slate-600"
          >
            Vốn tiền mặt
          </Label>
          {isLoading ? (
            <Skeleton className="h-14! w-full  rounded-xl!" />
          ) : (
            <AutoCompleteField<CustomInputProps>
              component={NumericInput}
              version="field"
              placeholder="0"
              name="capitalCash"
              variant="default"
              className="h-10! w-full rounded-lg! border-slate-200 bg-white px-3 text-sm"
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
            className="text-xs font-medium text-slate-600"
          >
            Vốn chuyển khoản
          </Label>
          {isLoading ? (
            <Skeleton className="h-14! w-full  rounded-xl!" />
          ) : (
            <AutoCompleteField<CustomInputProps>
              component={NumericInput}
              version="field"
              placeholder="0"
              name="capitalBank"
              variant="default"
              className="h-10! w-full rounded-lg! border-slate-200 bg-white px-3 text-sm"
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
