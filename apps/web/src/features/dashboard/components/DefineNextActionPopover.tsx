import type { LeadSummary } from "@vetra/contracts";
import { PlusIcon } from "lucide-react";
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

import { useCreateNextAction } from "../mutations/useCreateNextAction";
import { inDays } from "../utils/dueDates";
import NextActionForm from "./NextActionForm";

export function DefineNextActionPopover({ lead }: { lead: LeadSummary }) {
  const [open, setOpen] = useState(false);
  const createNextAction = useCreateNextAction();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button size="xs" variant="outline" />}>
        <PlusIcon />
        Definir ação
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Próxima ação</PopoverTitle>
          <PopoverDescription>{lead.businessName}</PopoverDescription>
        </PopoverHeader>
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
            createNextAction.mutate(
              { ...next, leadId: lead.id },
              { onSuccess: () => setOpen(false) }
            )
          }
        />
      </PopoverContent>
    </Popover>
  );
}
