import { type DealPaymentRequest, MAX_INSTALLMENTS } from "@vetra/contracts";
import { Controller, useFormContext } from "react-hook-form";

import { DueDatePicker } from "@/shared/components/next-actions/DueDatePicker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatDayLabel } from "@/shared/utils/date";
import { inDays } from "@/shared/utils/dueDates";
import { formatCurrency, parseCurrencyToCents, pluralize } from "@/shared/utils/format";
import { maskCurrency, masked } from "@/shared/utils/masks";

export type DealFormValues = {
  value: string;
  received: string;
  installments: string;
  dueAt: Date;
  monthlyFee: string;
};

export const emptyDealValues = (): DealFormValues => ({
  value: "",
  received: "",
  installments: "1",
  dueAt: inDays(7),
  monthlyFee: "",
});

const receivedOf = (text: string) => (text.trim() === "" ? 0 : (parseCurrencyToCents(text) ?? 0));

const installmentsOf = (text: string) =>
  Math.min(MAX_INSTALLMENTS, Math.max(0, Math.floor(Number(text) || 0)));

// Null while the closed value is not filled in.
export function toDealPayment(values: DealFormValues): DealPaymentRequest | null {
  const closedValueInCents = parseCurrencyToCents(values.value);
  if (closedValueInCents === null) return null;

  const receivedInCents = receivedOf(values.received);
  const hasRemaining = closedValueInCents > receivedInCents;
  const installmentsCount = hasRemaining ? installmentsOf(values.installments) : 0;

  return {
    closedValueInCents,
    receivedInCents,
    installmentsCount,
    firstInstallmentDueAt: installmentsCount > 0 ? values.dueAt.toISOString() : undefined,
    monthlyFeeInCents: parseCurrencyToCents(values.monthlyFee) ?? undefined,
  };
}

function summaryOf(closedValueInCents: number, received: number, installments: number): string {
  const remaining = closedValueInCents - received;
  if (remaining === 0) return "Pago integralmente, sem parcelas.";
  if (installments === 0) {
    return `Restam ${formatCurrency(remaining)}, sem parcelas: você registra os pagamentos depois.`;
  }
  const each = Math.round(remaining / installments);
  return `Restam ${formatCurrency(remaining)} em ${pluralize(installments, "parcela", "parcelas")}${
    installments > 1 ? ` de cerca de ${formatCurrency(each)}` : ""
  }.`;
}

// How a deal is paid, asked whenever a lead becomes a customer. The rest after the amount
// already received can be split into installments, or left unscheduled. Must sit inside a
// react-hook-form FormProvider.
export function DealFields({ autoFocus = false }: { autoFocus?: boolean }) {
  const { register, control, watch, getValues, formState } = useFormContext<DealFormValues>();
  const { errors } = formState;

  const closedValueInCents = parseCurrencyToCents(watch("value"));
  const received = receivedOf(watch("received"));
  const installments = installmentsOf(watch("installments"));
  const remaining = closedValueInCents === null ? 0 : closedValueInCents - received;

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
          {...masked(
            register("value", {
              validate: (text) => parseCurrencyToCents(text) !== null || "Informe o valor fechado.",
            }),
            maskCurrency
          )}
        />
        <FieldError errors={[errors.value]} />
      </Field>

      <Field data-invalid={Boolean(errors.received)}>
        <FieldLabel htmlFor="deal-received">
          Já recebido <span className="text-muted-foreground font-normal">(opcional)</span>
        </FieldLabel>
        <Input
          id="deal-received"
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-invalid={Boolean(errors.received)}
          {...masked(
            register("received", {
              validate: (text) => {
                const closed = parseCurrencyToCents(getValues("value"));
                return (
                  closed === null ||
                  receivedOf(text) <= closed ||
                  "O valor recebido não pode passar do valor fechado."
                );
              },
            }),
            maskCurrency
          )}
        />
        <FieldError errors={[errors.received]} />
        <FieldDescription>Pagamento à vista ou entrada, já registrado como pago.</FieldDescription>
      </Field>

      {remaining > 0 && (
        <Field data-invalid={Boolean(errors.installments)}>
          <FieldLabel htmlFor="deal-installments">Parcelas do restante</FieldLabel>
          <Input
            id="deal-installments"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_INSTALLMENTS}
            aria-invalid={Boolean(errors.installments)}
            {...register("installments", {
              validate: (text) => {
                const count = Number(text);
                return (
                  (Number.isInteger(count) && count >= 0 && count <= MAX_INSTALLMENTS) ||
                  `Use de 0 a ${MAX_INSTALLMENTS} parcelas.`
                );
              },
            })}
          />
          <FieldError errors={[errors.installments]} />
          <FieldDescription>
            {summaryOf(closedValueInCents ?? 0, received, installments)}
          </FieldDescription>
        </Field>
      )}

      <Field data-invalid={Boolean(errors.monthlyFee)}>
        <FieldLabel htmlFor="deal-monthly-fee">
          Mensalidade <span className="text-muted-foreground font-normal">(opcional)</span>
        </FieldLabel>
        <Input
          id="deal-monthly-fee"
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-invalid={Boolean(errors.monthlyFee)}
          {...masked(
            register("monthlyFee", {
              validate: (text) =>
                text.trim() === "" ||
                parseCurrencyToCents(text) !== null ||
                "Informe um valor maior que zero.",
            }),
            maskCurrency
          )}
        />
        <FieldError errors={[errors.monthlyFee]} />
        <FieldDescription>
          Valor fixo por mês, como manutenção. Aparece no Recorrente do Painel.
        </FieldDescription>
      </Field>

      {remaining > 0 && installments > 0 && (
        <Field>
          <FieldLabel>Vencimento da primeira parcela · {formatDayLabel(watch("dueAt"))}</FieldLabel>
          <Controller
            control={control}
            name="dueAt"
            render={({ field }) => (
              <DueDatePicker value={field.value} onChange={field.onChange} withTime={false} />
            )}
          />
          <FieldDescription>As demais vencem a cada mês, no mesmo dia.</FieldDescription>
        </Field>
      )}
    </>
  );
}
