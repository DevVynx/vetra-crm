import type { NextAction } from "@vetra/contracts";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { FormSheet } from "@/shared/components/FormSheet";
import {
  NextActionFields,
  type NextActionFormValues,
} from "@/shared/components/next-actions/NextActionFields";
import { Button } from "@/shared/components/ui/button";
import { useDeleteNextAction } from "@/shared/mutations/next-actions/useDeleteNextAction";
import { useUpdateNextAction } from "@/shared/mutations/next-actions/useUpdateNextAction";

type EditNextActionSheetProps = {
  action: NextAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditNextActionSheet({ action, open, onOpenChange }: EditNextActionSheetProps) {
  const updateNextAction = useUpdateNextAction();
  const deleteNextAction = useDeleteNextAction();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { id, type, followUpStep, description, body, dueAt } = action;
  const form = useForm<NextActionFormValues>({
    defaultValues: { description, body: body ?? "", dueAt: new Date(dueAt) },
  });
  const { reset } = form;

  useEffect(() => {
    if (open) reset({ description, body: body ?? "", dueAt: new Date(dueAt) });
  }, [open, description, body, dueAt, reset]);

  const submit = form.handleSubmit((values) =>
    updateNextAction.mutate(
      {
        id,
        type,
        followUpStep,
        description: values.description.trim(),
        body: values.body.trim() === "" ? null : values.body.trim(),
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
        <NextActionFields withBody />
      </FormProvider>
      <Button
        type="button"
        variant="outline"
        className="text-destructive self-start"
        onClick={() => setIsConfirmingDelete(true)}
      >
        <Trash2Icon />
        Excluir atividade
      </Button>
      <ConfirmDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title="Excluir esta atividade?"
        description="Ela some da lista e não vai para o histórico. Dá para desfazer logo depois."
        confirmLabel="Excluir"
        destructive
        isPending={deleteNextAction.isPending}
        onConfirm={() =>
          deleteNextAction.mutate(action, {
            onSuccess: () => {
              setIsConfirmingDelete(false);
              onOpenChange(false);
            },
          })
        }
      />
    </FormSheet>
  );
}
