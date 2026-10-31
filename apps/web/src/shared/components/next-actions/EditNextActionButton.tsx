import type { NextAction } from "@vetra/contracts";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { EditNextActionSheet } from "@/shared/components/next-actions/EditNextActionSheet";
import { Button } from "@/shared/components/ui/button";

export function EditNextActionButton({ action }: { action: NextAction }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <PencilIcon />
        Editar
      </Button>
      <EditNextActionSheet action={action} open={open} onOpenChange={setOpen} />
    </>
  );
}
