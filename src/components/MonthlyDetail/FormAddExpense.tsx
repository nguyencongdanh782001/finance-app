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
      <Form className="w-full rounded-2xl border border-gray-200 p-6 space-y-4 bg-white shadow-sm">
        {/* Mô tả chi phí */}
        <div className="flex flex-col gap-2 w-full">
          <Label
            variant="secondary"
            className="text-green-1! text-11px font-bold"
          >
            Mô tả chi phí
          </Label>
          <AutoCompleteField<CustomInputProps>
            component={Input}
            version="field"
            placeholder="Nhập chi phí"
            name="name"
            variant="default"
            className="bg-gray-1! h-14! rounded-xl! w-full py-2.5 pl-3.5 text-sm text-gray-17 border border-gray-8 font-normal !placeholder:font-normal"
          />
        </div>

        {/* Số tiền */}
        <div>
          <div className="flex flex-col gap-2 w-full">
            <Label
              variant="secondary"
              className="text-green-1! text-11px font-bold"
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
                  className="bg-gray-1! h-14! rounded-xl! w-full py-2.5 pl-3.5 text-sm text-gray-17 border border-gray-8 font-normal !placeholder:font-normal"
                  pattern="^\d+(\.\d*)?$"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !dirty}
                className="shadow-sm! h-14! w-30! flex items-center gap-2 rounded-xl bg-green-9 hover:bg-green-9/80 text-base text-white font-bold"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-3.5 h-3.5 text-white" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-white" />
                )}
                Thêm
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </FormikProvider>
  );
}
