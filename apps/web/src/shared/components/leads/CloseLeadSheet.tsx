import { HandshakeIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import {
  DealFields,
  type DealFormValues,
  emptyDealValues,
  toDealPayment,
} from "@/shared/components/detail/DealFields";
import { FormSheet } from "@/shared/components/FormSheet";
import { useCloseLead } from "@/shared/mutations/leads/useCloseLead";

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

  const submit = form.handleSubmit((values) => {
    const payment = toDealPayment(values);
    if (payment) closeLead.mutate(payment);
  });

  return (
    <FormSheet
      icon={HandshakeIcon}
      open={open}
      onOpenChange={onOpenChange}
      title={`Fechar ${businessName}`}
      description="O lead vira cliente com este valor. Mensalidade e novos registros você ajusta depois, na página do cliente."
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
