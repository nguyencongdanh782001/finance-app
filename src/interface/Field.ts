import { InputProps } from "@/components/ui/input";
import { TextAreaProps } from "@/components/ui/textarea";
import { FieldProps } from "formik";

export interface CustomFieldProps {
  version?: "field" | "fast-field"; // choose which version formik field you want
  children: React.ReactNode;
}

export interface OptionProps {
  label: string;
  value: string;
}

export interface CustomInputProps
  extends InputProps, Omit<CustomFieldProps, "children"> {}
// export interface CustomTimePickerProps
//   extends TimePickerProps,
//     Omit<CustomFieldProps, 'children'> {}

export interface CustomTextAreaProps
  extends TextAreaProps, Omit<CustomFieldProps, "children"> {}

// export interface CustomSelectProps extends SelectProps, Omit<CustomFieldProps, 'children'> {}

// export interface CustomRadioProps extends RadioProps, Omit<CustomFieldProps, 'children'> {}

// export interface CustomMultiSelectProps
//   extends MultiSelectProps,
//     Omit<CustomFieldProps, 'children'> {}

// export interface CustomDatePickerProps
//   extends DatePickerProps,
//     Omit<CustomFieldProps, 'children'> {}

export type AutoCompleteFieldProps<T> = T &
  Omit<CustomFieldProps, "children"> & {
    component: React.FC<FieldProps & T>;
  };

// export interface CustomAutoSuggestFieldProps
//   extends AutoSuggestFieldProps,
//     Omit<CustomFieldProps, 'children'> {}

// export type CustomCheckBoxProps = Omit<CustomFieldProps, 'children'> &
//   Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'type'> &
//   CheckboxProps & { label?: string; lblClassname?: string };
