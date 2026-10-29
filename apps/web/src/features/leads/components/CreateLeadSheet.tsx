import { UserPlusIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { ContactFormFields } from "@/shared/components/detail/ContactFormFields";
import { FormSheet } from "@/shared/components/FormSheet";
import {
  type ContactFormValues,
  emptyContactValues,
  toLeadRequest,
} from "@/shared/utils/contactForm";

import { useCreateLead } from "../mutations/useCreateLead";

type CreateLeadSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateLeadSheet({ open, onOpenChange }: CreateLeadSheetProps) {
  const form = useForm<ContactFormValues>({ defaultValues: emptyContactValues });

  const createLead = useCreateLead(() => {
    onOpenChange(false);
    form.reset(emptyContactValues);
  });

  const submit = form.handleSubmit((values) => createLead.mutate(toLeadRequest(values)));

  return (
    <FormSheet
      icon={UserPlusIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Novo lead"
      description="O lead entra na etapa Prospectado."
      submitLabel="Criar lead"
      isPending={createLead.isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <ContactFormFields />
      </FormProvider>
    </FormSheet>
  );
}
