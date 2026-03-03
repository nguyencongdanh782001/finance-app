"use client";
import { CustomInputProps } from "@/interface/Field";
import {
  DailyDetailResponse,
  UpdateDailyRequest,
} from "@/interface/financeAPI";
import { Form, FormikProvider, useFormik } from "formik";
import { debounce } from "lodash";
import { WalletIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import AutoCompleteField from "../common/CustomFields/AutoCompleteField";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { financeAPI } from "@/endpoint/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import { toast } from "@/hook/use-toast";
import { useParams } from "next/navigation";

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

  const fuzzySubmit = useCallback(
    debounce(
      async (
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

  const { values, isSubmitting, setSubmitting, dirty } = formik;

  useEffect(() => {
    if (dirty && !isLoading && !reload) {
      fuzzySubmit(values, setSubmitting);
    }
  }, [values, dirty]);

  return (
    <FormikProvider value={formik}>
      <Form className="w-full rounded-2xl border border-gray-200 p-6 space-y-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-1">
            <WalletIcon className="size-4 text-gray-2" />
          </div>
          <p className="text-13px text-gray-2 font-bold uppercase">
            Tiền Vốn Đầu Ngày
          </p>
        </div>

        {/* Vốn tiền mặt */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-green-1! text-11px font-bold"
          >
            Vốn tiền mặt
          </Label>
          {isLoading ? (
            <Skeleton className="h-14! w-full  rounded-xl! bg-gray-300" />
          ) : (
            <AutoCompleteField<CustomInputProps>
              component={Input}
              version="field"
              placeholder="0"
              name="capitalCash"
              variant="default"
              className="bg-gray-1! h-14! rounded-xl! border-gray-1! w-full py-2.5 pl-3.5 text-sm text-gray-17 border border-gray-8 font-normal !placeholder:font-normal"
              pattern="^\d+(\.\d*)?$"
              disabled={isSubmitting || isLoading || reload}
            />
          )}
        </div>

        {/* Vốn chuyển khoản */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-green-1! text-11px font-bold"
          >
            Vốn chuyển khoản
          </Label>
          {isLoading ? (
            <Skeleton className="h-14! w-full  rounded-xl! bg-gray-300" />
          ) : (
            <AutoCompleteField<CustomInputProps>
              component={Input}
              version="field"
              placeholder="0"
              name="capitalBank"
              variant="default"
              className="bg-gray-1! h-14! rounded-xl! border-gray-1! w-full py-2.5 pl-3.5 text-sm text-gray-17 border border-gray-8 font-normal !placeholder:font-normal"
              pattern="^\d+(\.\d*)?$"
              disabled={isSubmitting || isLoading || reload}
            />
          )}
        </div>
      </Form>
    </FormikProvider>
  );
}
