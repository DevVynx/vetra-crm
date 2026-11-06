import { CalendarPlusIcon } from "lucide-react";
import { useEffect } from "react";
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

const emptyValues = (): NextActionFormValues => ({ description: "", body: "", dueAt: inDays(1) });

export function NewActivitySheet({
  leadId,
  businessName,
  open,
  onOpenChange,
}: NewActivitySheetProps) {
  const createNextAction = useCreateNextAction();
  const form = useForm<NextActionFormValues>({ defaultValues: emptyValues() });
  const { reset } = form;

  // The default date is "tomorrow" as of the moment it opens, not of the moment the page loaded.
  useEffect(() => {
    if (open) reset(emptyValues());
  }, [open, reset]);

  const submit = form.handleSubmit(({ description, body, dueAt }) =>
    createNextAction.mutate(
      {
        leadId,
        type: "custom",
        followUpStep: null,
        description: description.trim(),
        body: body.trim() === "" ? null : body.trim(),
        dueAt: dueAt.toISOString(),
      },
      {
        onSuccess: () => onOpenChange(false),
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
        <NextActionFields withBody />
      </FormProvider>
    </FormSheet>
  );
}
