import type { NextActionInput } from "@vetra/contracts";
import { FormProvider, useForm } from "react-hook-form";

import {
  NextActionFields,
  type NextActionFormValues,
} from "@/shared/components/next-actions/NextActionFields";
import { Button } from "@/shared/components/ui/button";

type NextActionFormProps = {
  defaultValues: NextActionInput;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (next: NextActionInput) => void;
};

export default function NextActionForm({
  defaultValues,
  submitLabel,
  isPending,
  onSubmit,
}: NextActionFormProps) {
  const form = useForm<NextActionFormValues>({
    defaultValues: {
      description: defaultValues.description,
      dueAt: new Date(defaultValues.dueAt),
    },
  });

  const submit = form.handleSubmit(({ description, dueAt }) =>
    onSubmit({
      type: defaultValues.type,
      followUpStep: defaultValues.followUpStep,
      description: description.trim(),
      dueAt: dueAt.toISOString(),
    })
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <NextActionFields />
        <Button type="submit" className="h-10 font-semibold" disabled={isPending}>
          {submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
