import { Controller, useFormContext } from "react-hook-form";

import { DueDatePicker } from "@/shared/components/next-actions/DueDatePicker";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { formatDayLabel } from "@/shared/utils/date";

// Equal to the limit of the contract (nextAction.ts).
export const NEXT_ACTION_BODY_MAX_LENGTH = 4000;

export type NextActionFormValues = {
  description: string;
  body: string;
  dueAt: Date;
};

export function NextActionFields({ withBody = false }: { withBody?: boolean }) {
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

      {withBody && (
        <Field>
          <FieldLabel htmlFor="next-action-body">Texto (opcional)</FieldLabel>
          <Textarea
            id="next-action-body"
            rows={4}
            maxLength={NEXT_ACTION_BODY_MAX_LENGTH}
            placeholder="Ex.: a mensagem que será enviada"
            {...register("body")}
          />
        </Field>
      )}

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
