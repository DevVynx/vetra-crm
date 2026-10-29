import { CalendarPlusIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { FormSheet } from "@/shared/components/FormSheet";
import {
  NextActionFields,
  type NextActionFormValues,
} from "@/shared/components/next-actions/NextActionFields";
import { useCreateNextAction } from "@/shared/mutations/next-actions/useCreateNextAction";
import { inDays } from "@/shared/utils/dueDates";

type NewActivitySheetProps = {
  leadId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyValues = (): NextActionFormValues => ({ description: "", dueAt: inDays(1) });

export function NewActivitySheet({ leadId, businessName, open, onOpenChange }: NewActivitySheetProps) {
  const createNextAction = useCreateNextAction();
  const form = useForm<NextActionFormValues>({ defaultValues: emptyValues() });

  const submit = form.handleSubmit(({ description, dueAt }) =>
    createNextAction.mutate(
      {
        leadId,
        type: "custom",
        followUpStep: null,
        description: description.trim(),
        dueAt: dueAt.toISOString(),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset(emptyValues());
        },
      }
    )
  );

  return (
    <FormSheet
      icon={CalendarPlusIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Nova atividade"
      description={businessName}
      submitLabel="Agendar"
      isPending={createNextAction.isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <NextActionFields />
      </FormProvider>
    </FormSheet>
  );
}
