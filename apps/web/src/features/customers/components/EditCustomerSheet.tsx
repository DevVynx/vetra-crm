import type { CustomerDetail } from "@vetra/contracts";
import { PencilIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { ContactFormFields } from "@/shared/components/detail/ContactFormFields";
import { FormSheet } from "@/shared/components/FormSheet";
import { type ContactFormValues, toCustomerRequest } from "@/shared/utils/contactForm";
import { formatPhone } from "@/shared/utils/format";

import { useUpdateCustomer } from "../mutations/useUpdateCustomer";

type EditCustomerSheetProps = {
  customer: CustomerDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCustomerSheet({ customer, open, onOpenChange }: EditCustomerSheetProps) {
  const form = useForm<ContactFormValues>({
    values: {
      businessName: customer.businessName,
      contactName: customer.contactName ?? "",
      phone: formatPhone(customer.phone),
      document: customer.document ?? "",
      email: customer.email ?? "",
      niche: customer.niche,
      city: customer.city,
    },
  });
  const { save, isPending } = useUpdateCustomer(customer, () => onOpenChange(false));

  const submit = form.handleSubmit((values) => save(toCustomerRequest(values)));

  return (
    <FormSheet
      icon={PencilIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Editar cliente"
      description="Os mesmos dados aparecem no cadastro do lead."
      submitLabel="Salvar alterações"
      isPending={isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <ContactFormFields showDocument />
      </FormProvider>
    </FormSheet>
  );
}
