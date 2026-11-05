import type { LeadDetail } from "@vetra/contracts";
import { PencilIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { ContactFormFields } from "@/shared/components/detail/ContactFormFields";
import { FormSheet } from "@/shared/components/FormSheet";
import {
  type ContactFormValues,
  emptyContactValues,
  toLeadRequest,
} from "@/shared/utils/contactForm";
import { storedPhoneToInput } from "@/shared/utils/masks";

import { useUpdateLead } from "../mutations/useUpdateLead";

type EditLeadSheetProps = {
  lead: LeadDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditLeadSheet({ lead, open, onOpenChange }: EditLeadSheetProps) {
  const form = useForm<ContactFormValues>({
    values: {
      ...emptyContactValues,
      businessName: lead.businessName,
      contactName: lead.contactName ?? "",
      phone: storedPhoneToInput(lead.phone),
      email: lead.email ?? "",
      demoUrl: lead.demoUrl ?? "",
      niche: lead.niche,
      city: lead.city,
    },
  });
  const { save, isPending } = useUpdateLead(lead, () => onOpenChange(false));

  const submit = form.handleSubmit((values) => save(toLeadRequest(values)));

  return (
    <FormSheet
      icon={PencilIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Editar lead"
      submitLabel="Salvar alterações"
      isPending={isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <ContactFormFields showDemo />
      </FormProvider>
    </FormSheet>
  );
}
