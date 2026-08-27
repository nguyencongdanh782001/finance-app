"use client";
import { Form, useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Label } from "../ui/label";
import AutoCompleteField from "../common/CustomFields/AutoCompleteField";
import { CustomInputProps } from "@/interface/Field";
import { NumericInput } from "../ui/numberInput";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { financeAPI } from "@/endpoint/financeAPI";
import { useParams } from "next/navigation";
import { CreateMonthlyExpenseRequest } from "@/interface/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import { toast } from "@/hook/use-toast";
import { Loader2, Plus } from "lucide-react";

const initialValues: CreateMonthlyExpenseRequest = {
  name: "",
  amount: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Vui lòng nhập mô tả"),
  amount: Yup.string().required("Vui lòng nhập số tiền"),
});

export default function FormAddExpense({ reload }: { reload: () => void }) {
  const params = useParams();

  const id = Number(params.id);

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (value, action) => {
      action.setSubmitting(true);
      const res = await financeAPI.putMonthlyDetailData(id, {
        ...value,
        amount: Number(value.amount),
      });

      if (res.code === RESPONSE_CODES.success) {
        action.resetForm();
        reload();
      } else {
        toast({
          title: "Tạo chi phí thất bại",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
      }

      action.setSubmitting(false);
    },
  });

  const { isSubmitting, dirty } = formik;

  return (
    <FormikProvider value={formik}>
      <Form className="grid w-full gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end sm:p-5">
        {/* Mô tả chi phí */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-xs font-medium text-slate-600"
          >
            Mô tả chi phí
          </Label>
          <AutoCompleteField<CustomInputProps>
            component={Input}
            version="field"
            placeholder="Nhập chi phí"
            name="name"
            variant="default"
            className="h-10! w-full rounded-lg! border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        {/* Số tiền */}
        <div>
          <div className="flex flex-col gap-2 w-full">
            <Label
              variant="secondary"
              className="text-xs font-medium text-slate-600"
            >
              Số tiền (VND)
            </Label>
            <div className="flex w-full items-start gap-3">
              <div className="flex flex-col w-full">
                <AutoCompleteField<CustomInputProps>
                  component={NumericInput}
                  version="field"
                  placeholder="0"
                  name="amount"
                  variant="default"
                  className="h-10! w-full rounded-lg! border-slate-200 bg-white px-3 text-sm"
                  pattern="^\d+(\.\d*)?$"
                />
              </div>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          variant="adminPrimary"
          disabled={isSubmitting || !dirty}
          className="h-10 w-full rounded-lg sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Thêm
        </Button>
      </Form>
    </FormikProvider>
  );
}
