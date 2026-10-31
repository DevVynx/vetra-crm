import { HandshakeIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import {
  DealFields,
  type DealFormValues,
  emptyDealValues,
} from "@/shared/components/detail/DealFields";
import { FormSheet } from "@/shared/components/FormSheet";
import { parseCurrencyToCents } from "@/shared/utils/format";

import { useCloseLead } from "../mutations/useCloseLead";

type CloseLeadSheetProps = {
  leadId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CloseLeadSheet({ leadId, businessName, open, onOpenChange }: CloseLeadSheetProps) {
  const form = useForm<DealFormValues>({ defaultValues: emptyDealValues() });

  const closeLead = useCloseLead(leadId, () => {
    onOpenChange(false);
    form.reset(emptyDealValues());
  });

  const submit = form.handleSubmit(({ value, dueAt }) => {
    const closedValueInCents = parseCurrencyToCents(value);
    if (closedValueInCents === null) return;
    closeLead.mutate({ closedValueInCents, firstInstallmentDueAt: dueAt.toISOString() });
  });

  return (
    <FormSheet
      icon={HandshakeIcon}
      open={open}
      onOpenChange={onOpenChange}
      title={`Fechar ${businessName}`}
      description="O lead vira cliente com este valor. Parcelas e mensalidade você ajusta depois, na página do cliente."
      submitLabel="Fechar e criar cliente"
      isPending={closeLead.isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <DealFields autoFocus />
      </FormProvider>
    </FormSheet>
  );
}
