import { LockIcon, MessageCirclePlusIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type NoConversationSelectedProps = {
  canStartConversation: boolean;
  onNewConversation: () => void;
};

export function NoConversationSelected({
  canStartConversation,
  onNewConversation,
}: NoConversationSelectedProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div aria-hidden className="flex w-52 flex-col gap-1.5">
        <div className="bg-muted h-7 w-3/5 rounded-lg rounded-bl-sm" />
        <div className="bg-primary/15 h-7 w-1/2 self-end rounded-lg rounded-br-sm" />
        <div className="bg-muted h-7 w-2/3 rounded-lg rounded-bl-sm" />
        <div className="bg-primary/15 h-7 w-2/5 self-end rounded-lg rounded-br-sm" />
      </div>

      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight">Suas conversas do WhatsApp</h2>
        <p className="text-muted-foreground text-sm">
          Escolha uma conversa na lista para ler e responder sem sair do Vetra.
        </p>
      </div>

      {canStartConversation && (
        <Button variant="outline" onClick={onNewConversation}>
          <MessageCirclePlusIcon />
          Nova conversa
        </Button>
      )}

      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <LockIcon className="size-3" />
        Suas conversas ficam guardadas apenas neste computador.
      </p>
    </div>
  );
}
