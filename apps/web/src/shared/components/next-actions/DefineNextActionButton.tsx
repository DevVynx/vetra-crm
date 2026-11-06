import type { LeadSummary } from "@vetra/contracts";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { NewActivitySheet } from "@/shared/components/next-actions/NewActivitySheet";
import { Button } from "@/shared/components/ui/button";

export function DefineNextActionButton({ lead }: { lead: LeadSummary }) {
  const [open, setOpen] = useState(false);
  const [wasOpened, setWasOpened] = useState(false);

  const openSheet = () => {
    setWasOpened(true);
    setOpen(true);
  };

  // A list has one of these buttons per row, so the sheet only exists once it was asked for.
  return (
    <>
      <Button size="xs" variant="outline" onClick={openSheet}>
        <PlusIcon />
        Definir ação
      </Button>
      {wasOpened && (
        <NewActivitySheet
          leadId={lead.id}
          businessName={lead.businessName}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
