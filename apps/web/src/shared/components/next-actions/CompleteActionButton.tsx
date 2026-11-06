import type { NextAction } from "@vetra/contracts";
import { CheckIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useCompleteNextAction } from "@/shared/mutations/next-actions/useCompleteNextAction";

export function CompleteActionButton({ action }: { action: NextAction }) {
  const completeNextAction = useCompleteNextAction();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={completeNextAction.isPending}
      onClick={() => completeNextAction.mutate(action.id)}
    >
      <CheckIcon />
      Concluir
    </Button>
  );
}
