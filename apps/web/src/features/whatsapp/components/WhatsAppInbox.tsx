import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

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
  const { conversation: selectedId } = route.useSearch();
  const navigate = route.useNavigate();
  const [startingConversation, setStartingConversation] = useState(false);

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
            selectedId && "hidden md:block"
          )}
        >
          <ConversationList
            selectedId={selectedId}
            isImporting={isImporting}
            canStartConversation={isConnected}
            onNewConversation={() => setStartingConversation(true)}
          />
        </aside>

        <section className={cn("min-w-0 flex-1", !selectedId && "hidden md:block")}>
          {selectedId ? (
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
