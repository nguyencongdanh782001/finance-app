"use client";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import { CustomTextAreaProps } from "@/interface/Field";
import {
  DailyDetailResponse,
  UpdateDailyRequest,
} from "@/interface/financeAPI";
import { Form, FormikProvider, useFormik } from "formik";
import { debounce } from "@/lib/debounce";
import { Text } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import AutoCompleteField from "../common/CustomFields/AutoCompleteField";
import { Skeleton } from "../ui/skeleton";
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
      <Form className="flex w-full flex-col gap-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Text className="size-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Ghi chú</p>
        </div>

        <div className="flex flex-col w-full">
          {isLoading ? (
            <Skeleton className="h-25! w-full rounded-xl!" />
          ) : (
            <AutoCompleteField<CustomTextAreaProps>
              component={Textarea}
              version="field"
              placeholder="Nhập ghi chú tại đây"
              name="note"
              variant="default"
              ref={textareaRef}
              className="min-h-25 max-h-75 w-full rounded-lg! border-slate-200 px-3 py-2.5 text-sm"
              onInput={(e) => resizeTextarea(e.currentTarget)}
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
