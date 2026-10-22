import type { NextAction } from "@vetra/contracts";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

import NextActionForm from "@/shared/components/next-actions/NextActionForm";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useCompleteNextAction } from "@/shared/mutations/next-actions/useCompleteNextAction";
import { suggestNextAction } from "@/shared/utils/suggestNextAction";

export function CompleteActionPopover({ action }: { action: NextAction }) {
  const [open, setOpen] = useState(false);
  const completeNextAction = useCompleteNextAction();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button size="sm" variant="outline" />}>
        <CheckIcon />
        Concluir
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Qual é a próxima ação?</PopoverTitle>
          <PopoverDescription>{action.lead.businessName}</PopoverDescription>
        </PopoverHeader>
        <NextActionForm
          defaultValues={suggestNextAction(action)}
          submitLabel="Concluir e agendar"
          isPending={completeNextAction.isPending}
          onSubmit={(next) =>
            completeNextAction.mutate({ id: action.id, next }, { onSuccess: () => setOpen(false) })
          }
        />
      </PopoverContent>
    </Popover>
  );
}
