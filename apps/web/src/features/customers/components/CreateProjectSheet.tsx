import type { ProjectStatus } from "@vetra/contracts";
import { FolderPlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { DateTimePicker } from "@/shared/components/DateTimePicker";
import { FormSheet } from "@/shared/components/FormSheet";
import { SegmentedChoice } from "@/shared/components/SegmentedChoice";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { atDefaultHour } from "@/shared/utils/dueDates";
import { parseCurrencyToCents } from "@/shared/utils/format";
import { maskCurrency, masked } from "@/shared/utils/masks";

import { useCreateCustomerProject } from "../mutations/useCreateCustomerProject";

type ProjectFormValues = {
  name: string;
  value: string;
  status: ProjectStatus;
  startedAt: Date;
};

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "in_production", label: "Em produção" },
  { value: "delivered", label: "Entregue" },
];

const emptyValues = (): ProjectFormValues => ({
  name: "",
  value: "",
  status: "in_production",
  startedAt: atDefaultHour(new Date()),
});

type CreateProjectSheetProps = {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProjectSheet({ customerId, open, onOpenChange }: CreateProjectSheetProps) {
  const form = useForm<ProjectFormValues>({ defaultValues: emptyValues() });
  const { register, control, formState } = form;
  const { errors } = formState;

  const createProject = useCreateCustomerProject(customerId, () => {
    onOpenChange(false);
    form.reset(emptyValues());
  });

  const submit = form.handleSubmit((values) => {
    const valueInCents = parseCurrencyToCents(values.value);
    if (valueInCents === null) return;
    createProject.mutate({
      name: values.name.trim(),
      status: values.status,
      valueInCents,
      startedAt: values.startedAt.toISOString(),
    });
  });

  return (
    <FormSheet
      icon={FolderPlusIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Novo projeto"
      submitLabel="Criar projeto"
      isPending={createProject.isPending}
      onSubmit={submit}
    >
      <Field data-invalid={Boolean(errors.name)}>
        <FieldLabel htmlFor="project-name">Nome do projeto</FieldLabel>
        <Input
          id="project-name"
          autoFocus
          placeholder="Ex.: Site institucional"
          aria-invalid={Boolean(errors.name)}
          {...register("name", { validate: (text) => text.trim().length > 0 || "Informe o nome." })}
        />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field data-invalid={Boolean(errors.value)}>
        <FieldLabel htmlFor="project-value">Valor</FieldLabel>
        <Input
          id="project-value"
          inputMode="decimal"
          placeholder="R$ 0,00"
          aria-invalid={Boolean(errors.value)}
          {...masked(
            register("value", {
              validate: (text) => parseCurrencyToCents(text) !== null || "Informe o valor.",
            }),
            maskCurrency
          )}
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
        <FieldLabel>Início</FieldLabel>
        <Controller
          control={control}
          name="startedAt"
          render={({ field }) => (
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              withTime={false}
              allowPast
            />
          )}
        />
      </Field>
    </FormSheet>
  );
}
