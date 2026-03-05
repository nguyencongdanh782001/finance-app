"use client";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import { CustomInputProps, CustomTextAreaProps } from "@/interface/Field";
import {
  DailyDetailResponse,
  UpdateDailyRequest,
} from "@/interface/financeAPI";
import { Form, FormikProvider, useFormik } from "formik";
import { debounce } from "lodash";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import AutoCompleteField from "../common/CustomFields/AutoCompleteField";
import { Label } from "../ui/label";
import { NumericInput } from "../ui/numberInput";
import { Skeleton } from "../ui/skeleton";
import { Text } from "lucide-react";
import { Textarea } from "../ui/textarea";

interface FormNoteProps {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  onReload: () => void;
  reload: boolean;
}

export default function FormNote(props: FormNoteProps) {
  const { data, isLoading, reload, onReload } = props;
  const params = useParams();

  const id = Number(params.id);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const initialValues: Pick<UpdateDailyRequest, "note"> = {
    note: data?.note || "",
  };

  const fuzzySubmit = useCallback(
    debounce(
      async (
        value: Pick<UpdateDailyRequest, "note">,
        setSubmitting: (isSubmitting: boolean) => void,
      ) => {
        setSubmitting(true);
        const res = await financeAPI.putDailyDetailData(id, {
          note: value.note || "",
        });

        if (res.code === RESPONSE_CODES.success) {
          onReload();
        } else {
          toast({
            title: "Cập nhật ghi chú thất bại",
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

  const { values, isSubmitting, submitForm, dirty } = formik;

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 300) + "px";
  };

  useEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current);
    }
  }, [values.note]);

  return (
    <FormikProvider value={formik}>
      <Form className="w-full flex flex-col rounded-2xl border border-gray-200 p-6 gap-y-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-1">
            <Text className="size-4 text-gray-2" />
          </div>
          <p className="text-13px text-gray-2 font-bold uppercase">Ghi chú</p>
        </div>

        <div className="flex flex-col w-full">
          {isLoading ? (
            <Skeleton className="h-25! w-full rounded-xl! bg-gray-300" />
          ) : (
            <AutoCompleteField<CustomTextAreaProps>
              component={Textarea}
              version="field"
              placeholder="Nhập ghi chú tại đây"
              name="note"
              variant="default"
              ref={textareaRef}
              className="min-h-25 max-h-75 rounded-xl! w-full py-2.5 pl-3.5 text-sm text-gray-17 border font-normal !placeholder:font-normal"
              onInput={(e) => resizeTextarea(e.currentTarget)}
              disabled={isSubmitting || isLoading || reload}
              onBlur={submitForm}
            />
          )}
        </div>

        <button disabled={!dirty} type="submit" className="hidden" />
      </Form>
    </FormikProvider>
  );
}
