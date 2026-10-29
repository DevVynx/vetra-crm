import { UserPlusIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { ContactFormFields } from "@/shared/components/detail/ContactFormFields";
import {
  DealFields,
  type DealFormValues,
  emptyDealValues,
} from "@/shared/components/detail/DealFields";
import { FormSheet } from "@/shared/components/FormSheet";
import {
  type ContactFormValues,
  emptyContactValues,
  toCustomerRequest,
} from "@/shared/utils/contactForm";
import { parseCurrencyToCents } from "@/shared/utils/format";

import { useCreateCustomer } from "../mutations/useCreateCustomer";

type CreateCustomerFormValues = ContactFormValues & DealFormValues;

const emptyValues = (): CreateCustomerFormValues => ({
  ...emptyContactValues,
  ...emptyDealValues(),
});

type CreateCustomerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCustomerSheet({ open, onOpenChange }: CreateCustomerSheetProps) {
  const form = useForm<CreateCustomerFormValues>({ defaultValues: emptyValues() });

  const createCustomer = useCreateCustomer(() => {
    onOpenChange(false);
    form.reset(emptyValues());
  });

  const submit = form.handleSubmit((values) => {
    const closedValueInCents = parseCurrencyToCents(values.value);
    if (closedValueInCents === null) return;
    createCustomer.mutate({
      ...toCustomerRequest(values),
      closedValueInCents,
      firstInstallmentDueAt: values.dueAt.toISOString(),
    });
  });

  return (
    <FormSheet
      icon={UserPlusIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Novo cliente"
      description="Um cliente é um lead que já fechou: ele entra com o valor fechado."
      submitLabel="Criar cliente"
      isPending={createCustomer.isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <ContactFormFields showDocument />
        <DealFields />
      </FormProvider>
    </FormSheet>
  );
}
