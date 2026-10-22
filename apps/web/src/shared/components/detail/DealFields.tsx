import { Controller, useFormContext } from "react-hook-form";

import { DueDatePicker } from "@/shared/components/next-actions/DueDatePicker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatDayLabel } from "@/shared/utils/date";
import { inDays } from "@/shared/utils/dueDates";
import { parseCurrencyToCents } from "@/shared/utils/format";

export type DealFormValues = {
  value: string;
  dueAt: Date;
};

export const emptyDealValues = (): DealFormValues => ({ value: "", dueAt: inDays(7) });

// Closed value and first due date, asked whenever a lead becomes a customer. Must sit inside a
// react-hook-form FormProvider.
export function DealFields({ autoFocus = false }: { autoFocus?: boolean }) {
  const { register, control, watch, formState } = useFormContext<DealFormValues>();
  const { errors } = formState;

  return (
    <>
      <Field data-invalid={Boolean(errors.value)}>
        <FieldLabel htmlFor="deal-value">Valor fechado</FieldLabel>
        <Input
          id="deal-value"
          autoFocus={autoFocus}
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-invalid={Boolean(errors.value)}
          {...register("value", {
            validate: (text) => parseCurrencyToCents(text) !== null || "Informe o valor fechado.",
          })}
        />
        <FieldError errors={[errors.value]} />
      </Field>

      <Field>
        <FieldLabel>Vencimento da primeira parcela · {formatDayLabel(watch("dueAt"))}</FieldLabel>
        <Controller
          control={control}
          name="dueAt"
          render={({ field }) => (
            <DueDatePicker value={field.value} onChange={field.onChange} withTime={false} />
          )}
        />
        <FieldDescription>Por enquanto o valor entra em parcela única, pendente.</FieldDescription>
      </Field>
    </>
  );
}
