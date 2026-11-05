import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/utils/cn";

import { useOpenLeadConversation } from "../mutations/useOpenLeadConversation";
import { whatsappErrorMessage } from "../utils/whatsappErrors";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import { NewConversationDialog } from "./NewConversationDialog";
import { NoConversationSelected } from "./NoConversationSelected";

const route = getRouteApi("/_app/whatsapp");

type WhatsAppInboxProps = {
  isConnected: boolean;
  isImporting: boolean;
  onConnect: () => void;
};

export function WhatsAppInbox({ isConnected, isImporting, onConnect }: WhatsAppInboxProps) {
  const { conversation: selectedId, leadId } = route.useSearch();
  const navigate = route.useNavigate();
  const [startingConversation, setStartingConversation] = useState(false);
  const { mutate: openLeadConversation } = useOpenLeadConversation();

  // Replaces the address, so going back doesn't land here again and reopen the same conversation.
  useEffect(() => {
    if (!leadId) return;

    openLeadConversation(leadId, {
      onSuccess: ({ id }) => void navigate({ search: { conversation: id }, replace: true }),
      onError: (error) => {
        toast.error(whatsappErrorMessage(error, "Não foi possível abrir a conversa."));
        void navigate({ search: {}, replace: true });
      },
    });
  }, [leadId, navigate, openLeadConversation]);

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      {!isConnected && (
        <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
          <p className="text-muted-foreground text-sm">
            WhatsApp desconectado. Você pode ler as conversas guardadas, mas não enviar mensagens.
          </p>
          <Button size="sm" variant="outline" onClick={onConnect}>
            Conectar
          </Button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "w-full min-w-0 md:w-80 md:shrink-0 md:border-r lg:w-96",
            (selectedId || leadId) && "hidden md:block"
          )}
        >
          <ConversationList
            selectedId={selectedId}
            isImporting={isImporting}
            canStartConversation={isConnected}
            onNewConversation={() => setStartingConversation(true)}
          />
        </aside>

        <section className={cn("min-w-0 flex-1", !selectedId && !leadId && "hidden md:block")}>
          {leadId ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : selectedId ? (
            <ConversationThread
              key={selectedId}
              conversationId={selectedId}
              isConnected={isConnected}
            />
          ) : (
            <NoConversationSelected
              canStartConversation={isConnected}
              onNewConversation={() => setStartingConversation(true)}
            />
          )}
        </section>
      </div>

      <NewConversationDialog
        open={startingConversation}
        onOpenChange={setStartingConversation}
        onOpened={(id) => void navigate({ search: { conversation: id } })}
      />
    </div>
  );
}
