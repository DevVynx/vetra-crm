import type { NextAction } from "@vetra/contracts";
import { SendIcon } from "lucide-react";
import { useState } from "react";

import { SendConfirmDialog } from "@/shared/components/next-actions/SendConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { useSendNextAction } from "@/shared/mutations/next-actions/useSendNextAction";
import { canBeSent } from "@/shared/utils/autoSend";

// Sends the text of the activity now. It always asks first, since a sent message cannot be unsent; the
// dialog is a different one for a lead that asked not to be contacted, and for a marker still to fill in.
export function SendActionButton({ action }: { action: NextAction }) {
  const send = useSendNextAction();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!canBeSent(action)) return null;

  const submit = (isWarning: boolean) =>
    send.mutate(
      { id: action.id, confirmed: isWarning },
      { onSettled: () => setIsConfirming(false) }
    );

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={send.isPending}
        onClick={() => setIsConfirming(true)}
      >
        <SendIcon />
        Enviar
      </Button>
      <SendConfirmDialog
        action={action}
        open={isConfirming}
        onOpenChange={setIsConfirming}
        isPending={send.isPending}
        onConfirm={submit}
      />
    </>
  );
}
