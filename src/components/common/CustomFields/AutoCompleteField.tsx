import React from 'react';
import { FastField, Field } from 'formik';
import { AutoCompleteFieldProps } from '@/interfaces/Field';

const FFIELD = {
  field: Field,
  'fast-field': FastField,
};

function AutoCompleteFieldInner<T>(props: AutoCompleteFieldProps<T>, ref: React.Ref<HTMLElement>) {
  const { component, version = 'fast-field', ...attr } = props;
  const FField = FFIELD[version];
  return <FField component={component} innerRef={ref} {...attr} />;
}

const AutoCompleteField = React.forwardRef(AutoCompleteFieldInner) as <T>(
  props: AutoCompleteFieldProps<T> & React.RefAttributes<HTMLElement>
) => JSX.Element;

export default AutoCompleteField;
