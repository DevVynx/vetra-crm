import type { NextAction } from "@vetra/contracts";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

import { useCompleteNextAction } from "../mutations/useCompleteNextAction";
import { suggestNextAction } from "../utils/suggestNextAction";
import NextActionForm from "./NextActionForm";

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
