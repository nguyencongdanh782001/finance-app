"use client";
import { Form, useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { CustomInputProps } from "@/interface/Field";
import { financeAPI } from "@/endpoint/financeAPI";
import { useParams } from "next/navigation";
import { CreateMonthlyExpenseRequest, Expense } from "@/interface/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import { toast } from "@/hook/use-toast";
import { Label } from "@/components/ui/label";
import AutoCompleteField from "@/components/common/CustomFields/AutoCompleteField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string().required("Vui lòng nhập mô tả"),
  amount: Yup.string().required("Vui lòng nhập số tiền"),
});

export default function FormEditExpense({
  reload,
  data,
  onClose,
}: {
  onClose: () => void;
  reload: () => void;
  data: Expense;
}) {
  const params = useParams();

  const id = Number(params.id);

  const initialValues: CreateMonthlyExpenseRequest = {
    name: data.name || "",
    amount: data.amount || "",
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (value, action) => {
      action.setSubmitting(true);
      const res = await financeAPI.putExpenseData(id, data.id, {
        ...value,
        amount: Number(value.amount),
      });

      if (res.code === RESPONSE_CODES.success) {
        action.resetForm();
        await onClose();
        reload();
      } else {
        toast({
          title: "Cập nhật chi phí thất bại",
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
      <Form className="w-full space-y-4 ">
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
            placeholder="Ví dụ: Văn phòng phẩm"
            name="name"
            variant="default"
            className="bg-gray-1! h-14! rounded-xl! border-gray-1! w-full py-2.5 pl-3.5 text-sm text-gray-17 border border-gray-8 font-normal !placeholder:font-normal"
          />
        </div>

        {/* Số tiền */}
        <div>
          <div className="flex flex-col gap-2 w-full">
            <Label
              variant="secondary"
              className="text-green-1! text-11px font-bold"
            >
              Số tiền (VNĐ)
            </Label>
            <div className="flex flex-col w-full">
              <AutoCompleteField<CustomInputProps>
                component={Input}
                version="field"
                placeholder="0"
                name="amount"
                variant="default"
                className="bg-gray-1! h-14! rounded-xl! border-gray-1! w-full py-2.5 pl-3.5 text-sm text-gray-17 border border-gray-8 font-normal !placeholder:font-normal"
                pattern="^\d+(\.\d*)?$"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !dirty}
          className="mt-8 shadow-sm! h-13.75! w-full flex items-center gap-2 rounded-xl bg-green-9 text-base text-white font-bold"
        >
          {isSubmitting && (
            <Loader2 className="animate-spin w-3.5 h-3.5 text-white" />
          )}
          Cập nhật
        </Button>
      </Form>
    </FormikProvider>
  );
}
