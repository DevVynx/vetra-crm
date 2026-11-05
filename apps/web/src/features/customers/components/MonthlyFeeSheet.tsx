import { CalendarSyncIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { FormSheet } from "@/shared/components/FormSheet";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { centsToInput, parseCurrencyToCents } from "@/shared/utils/format";
import { maskCurrency, masked } from "@/shared/utils/masks";

import { useUpdateMonthlyFee } from "../mutations/useUpdateMonthlyFee";

type MonthlyFeeSheetProps = {
  customerId: string;
  monthlyFeeInCents: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type MonthlyFeeValues = { monthlyFee: string };

export function MonthlyFeeSheet({
  customerId,
  monthlyFeeInCents,
  open,
  onOpenChange,
}: MonthlyFeeSheetProps) {
  const { save, isPending } = useUpdateMonthlyFee(customerId, monthlyFeeInCents);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MonthlyFeeValues>({
    values: { monthlyFee: monthlyFeeInCents ? centsToInput(monthlyFeeInCents) : "" },
  });

  const close = () => onOpenChange(false);

  const submit = handleSubmit(({ monthlyFee }) => save(parseCurrencyToCents(monthlyFee), close));

  return (
    <FormSheet
      icon={CalendarSyncIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Mensalidade"
      description="Valor fixo cobrado todo mês, como a manutenção do site."
      submitLabel="Salvar"
      isPending={isPending}
      onSubmit={submit}
    >
      <Field data-invalid={Boolean(errors.monthlyFee)}>
        <FieldLabel htmlFor="monthly-fee">Valor por mês</FieldLabel>
        <Input
          id="monthly-fee"
          autoFocus
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-invalid={Boolean(errors.monthlyFee)}
          {...masked(
            register("monthlyFee", {
              validate: (text) =>
                parseCurrencyToCents(text) !== null || "Informe um valor maior que zero.",
            }),
            maskCurrency
          )}
        />
        <FieldError errors={[errors.monthlyFee]} />
        <FieldDescription>Entra no Recorrente do Painel.</FieldDescription>
      </Field>
      {monthlyFeeInCents !== null && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={isPending}
          onClick={() => save(null, close)}
        >
          Remover mensalidade
        </Button>
      )}
    </FormSheet>
  );
}
