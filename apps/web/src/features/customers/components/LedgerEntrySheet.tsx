import type { LedgerEntry, LedgerEntryStatus, LedgerEntryType } from "@vetra/contracts";
import { ReceiptIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { DateTimePicker } from "@/shared/components/DateTimePicker";
import { FormSheet } from "@/shared/components/FormSheet";
import { SegmentedChoice } from "@/shared/components/SegmentedChoice";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { centsToInput, parseCurrencyToCents } from "@/shared/utils/format";

import { useLedgerEntryActions } from "../mutations/useLedgerEntryActions";

type LedgerEntryFormValues = {
  type: LedgerEntryType;
  description: string;
  value: string;
  status: LedgerEntryStatus;
  date: Date;
};

const typeOptions: { value: LedgerEntryType; label: string }[] = [
  { value: "revenue", label: "Receita" },
  { value: "expense", label: "Despesa" },
];

const statusOptions: { value: LedgerEntryStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmado" },
  { value: "pending", label: "Pendente" },
];

type LedgerEntrySheetProps = {
  customerId: string;
  entry?: LedgerEntry;
  defaultType?: LedgerEntryType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyValues = (type: LedgerEntryType): LedgerEntryFormValues => ({
  type,
  description: "",
  value: "",
  status: "confirmed",
  date: new Date(),
});

export function LedgerEntrySheet({
  customerId,
  entry,
  defaultType = "revenue",
  open,
  onOpenChange,
}: LedgerEntrySheetProps) {
  const { create, update, isPending } = useLedgerEntryActions(customerId);
  const form = useForm<LedgerEntryFormValues>({
    defaultValues: emptyValues(defaultType),
    values: entry && {
      type: entry.type,
      description: entry.description,
      value: centsToInput(entry.amountInCents),
      status: entry.status,
      date: new Date(entry.occurredAt),
    },
  });
  const { register, control, formState } = form;
  const { errors } = formState;

  const close = () => {
    onOpenChange(false);
    if (!entry) form.reset(emptyValues(defaultType));
  };

  const submit = form.handleSubmit((values) => {
    const amountInCents = parseCurrencyToCents(values.value);
    if (amountInCents === null) return;
    const request = {
      description: values.description.trim(),
      amountInCents,
      status: values.status,
      occurredAt: values.date.toISOString(),
    };
    if (entry) update(entry, request, close);
    else create({ ...request, type: values.type }, close);
  });

  return (
    <FormSheet
      icon={ReceiptIcon}
      open={open}
      onOpenChange={onOpenChange}
      title={entry ? "Editar registro" : "Novo registro"}
      description={
        entry ? undefined : "Receitas somam ao faturamento do cliente e despesas saem do saldo."
      }
      submitLabel={entry ? "Salvar alterações" : "Criar registro"}
      isPending={isPending}
      onSubmit={submit}
    >
      {!entry && (
        <Field>
          <FieldLabel>Tipo</FieldLabel>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SegmentedChoice
                ariaLabel="Tipo"
                options={typeOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
      )}

      <Field data-invalid={Boolean(errors.description)}>
        <FieldLabel htmlFor="entry-description">Descrição</FieldLabel>
        <Input
          id="entry-description"
          autoFocus
          aria-invalid={Boolean(errors.description)}
          {...register("description", {
            validate: (text) => text.trim().length > 0 || "Descreva o registro.",
          })}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <Field data-invalid={Boolean(errors.value)}>
        <FieldLabel htmlFor="entry-value">Valor</FieldLabel>
        <Input
          id="entry-value"
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-invalid={Boolean(errors.value)}
          {...register("value", {
            validate: (text) => parseCurrencyToCents(text) !== null || "Informe o valor.",
          })}
        />
        <FieldError errors={[errors.value]} />
      </Field>

      <Field>
        <FieldLabel>Situação</FieldLabel>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <SegmentedChoice
              ariaLabel="Situação"
              options={statusOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field>
        <FieldLabel>Data</FieldLabel>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateTimePicker value={field.value} onChange={field.onChange} exactTime allowPast />
          )}
        />
      </Field>
    </FormSheet>
  );
}
