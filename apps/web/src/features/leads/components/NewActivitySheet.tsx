import NextActionForm from "@/shared/components/next-actions/NextActionForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useCreateNextAction } from "@/shared/mutations/next-actions/useCreateNextAction";
import { inDays } from "@/shared/utils/dueDates";

type NewActivitySheetProps = {
  leadId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewActivitySheet({ leadId, businessName, open, onOpenChange }: NewActivitySheetProps) {
  const createNextAction = useCreateNextAction();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova atividade</SheetTitle>
          <SheetDescription>{businessName}</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <NextActionForm
            defaultValues={{
              type: "custom",
              followUpStep: null,
              description: "",
              dueAt: inDays(1).toISOString(),
            }}
            submitLabel="Agendar"
            isPending={createNextAction.isPending}
            onSubmit={(next) =>
              createNextAction.mutate({ ...next, leadId }, { onSuccess: () => onOpenChange(false) })
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
