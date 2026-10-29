import { Controller, useFormContext } from "react-hook-form";

import { DueDatePicker } from "@/shared/components/next-actions/DueDatePicker";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatDayLabel } from "@/shared/utils/date";

export type NextActionFormValues = {
  description: string;
  dueAt: Date;
};

export function NextActionFields() {
  const { register, control, watch, formState } = useFormContext<NextActionFormValues>();

  return (
    <>
      <Field data-invalid={Boolean(formState.errors.description)}>
        <FieldLabel htmlFor="next-action-description">O que fazer</FieldLabel>
        <Input
          id="next-action-description"
          autoFocus
          placeholder="Ex.: Follow-up 2"
          aria-invalid={Boolean(formState.errors.description)}
          {...register("description", {
            validate: (value) => value.trim().length > 0 || "Descreva a próxima ação.",
          })}
        />
        <FieldError errors={[formState.errors.description]} />
      </Field>

      <Field>
        <FieldLabel>Quando · {formatDayLabel(watch("dueAt"))}</FieldLabel>
        <Controller
          control={control}
          name="dueAt"
          render={({ field }) => <DueDatePicker value={field.value} onChange={field.onChange} />}
        />
      </Field>
    </>
  );
}
