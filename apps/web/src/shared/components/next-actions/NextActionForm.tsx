import type { NextActionInput } from "@vetra/contracts";
import { Controller, useForm } from "react-hook-form";

import { DueDatePicker } from "@/shared/components/next-actions/DueDatePicker";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatDayLabel } from "@/shared/utils/date";

type NextActionFormValues = {
  description: string;
  dueAt: Date;
};

type NextActionFormProps = {
  defaultValues: NextActionInput;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (next: NextActionInput) => void;
};

export default function NextActionForm({
  defaultValues,
  submitLabel,
  isPending,
  onSubmit,
}: NextActionFormProps) {
  const { register, control, handleSubmit, watch, formState } = useForm<NextActionFormValues>({
    defaultValues: {
      description: defaultValues.description,
      dueAt: new Date(defaultValues.dueAt),
    },
  });

  const submit = handleSubmit(({ description, dueAt }) =>
    onSubmit({
      type: defaultValues.type,
      followUpStep: defaultValues.followUpStep,
      description: description.trim(),
      dueAt: dueAt.toISOString(),
    })
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
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

      <Button type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
