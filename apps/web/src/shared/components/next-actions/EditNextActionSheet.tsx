import type { NextAction } from "@vetra/contracts";
import { PencilIcon } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { FormSheet } from "@/shared/components/FormSheet";
import {
  NextActionFields,
  type NextActionFormValues,
} from "@/shared/components/next-actions/NextActionFields";
import { useUpdateNextAction } from "@/shared/mutations/next-actions/useUpdateNextAction";

type EditNextActionSheetProps = {
  action: NextAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditNextActionSheet({ action, open, onOpenChange }: EditNextActionSheetProps) {
  const updateNextAction = useUpdateNextAction();
  const { id, type, followUpStep, description, dueAt } = action;
  const form = useForm<NextActionFormValues>({
    defaultValues: { description, dueAt: new Date(dueAt) },
  });
  const { reset } = form;

  useEffect(() => {
    if (open) reset({ description, dueAt: new Date(dueAt) });
  }, [open, description, dueAt, reset]);

  const submit = form.handleSubmit((values) =>
    updateNextAction.mutate(
      {
        id,
        type,
        followUpStep,
        description: values.description.trim(),
        dueAt: values.dueAt.toISOString(),
      },
      { onSuccess: () => onOpenChange(false) }
    )
  );

  return (
    <FormSheet
      icon={PencilIcon}
      open={open}
      onOpenChange={onOpenChange}
      title="Editar atividade"
      description={action.lead.businessName}
      submitLabel="Salvar"
      isPending={updateNextAction.isPending}
      onSubmit={submit}
    >
      <FormProvider {...form}>
        <NextActionFields />
      </FormProvider>
    </FormSheet>
  );
}
