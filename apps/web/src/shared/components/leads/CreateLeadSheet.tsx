import { UserPlusIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { ContactFormFields } from "@/shared/components/detail/ContactFormFields";
import { FormSheet } from "@/shared/components/FormSheet";
import { useCreateLead } from "@/shared/mutations/leads/useCreateLead";
import {
  type ContactFormValues,
  emptyContactValues,
  toLeadRequest,
} from "@/shared/utils/contactForm";

type CreateLeadSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<ContactFormValues>;
};

export function CreateLeadSheet({ open, onOpenChange, initialValues }: CreateLeadSheetProps) {
  const defaultValues = { ...emptyContactValues, ...initialValues };
  const form = useForm<ContactFormValues>({ defaultValues });

  const createLead = useCreateLead(() => {
    onOpenChange(false);
    form.reset(defaultValues);
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
        <ContactFormFields showDemo />
      </FormProvider>
    </FormSheet>
  );
}
