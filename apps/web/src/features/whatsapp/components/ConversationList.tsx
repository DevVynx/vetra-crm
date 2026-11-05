import { MessageCirclePlusIcon, SearchXIcon } from "lucide-react";
import { useState } from "react";

import { SearchField } from "@/shared/components/SearchField";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { useOnVisible } from "@/shared/hooks/useOnVisible";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

import { useWhatsappConversations } from "../queries/useWhatsappConversations";
import { ConversationListItem } from "./ConversationListItem";

const SEARCH_DEBOUNCE_MS = 300;

type ConversationListProps = {
  selectedId: string | undefined;
  isImporting: boolean;
  canStartConversation: boolean;
  onNewConversation: () => void;
};

export function ConversationList({
  selectedId,
  isImporting,
  canStartConversation,
  onNewConversation,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const applyQuery = useDebouncedCallback(setQuery, SEARCH_DEBOUNCE_MS);
  const conversations = useWhatsappConversations(query);
  // Pages go by position, so a conversation that moved up can come twice until the next refetch.
  const items = [
    ...new Map(
      conversations.data?.pages.flatMap((page) => page.items).map((item) => [item.id, item])
    ).values(),
  ];

  const loadMoreRef = useOnVisible(() => {
    if (conversations.hasNextPage && !conversations.isFetchingNextPage) {
      void conversations.fetchNextPage();
    }
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-2 border-b p-3">
        <div className="flex items-center gap-2">
          <SearchField
            className="min-w-0 flex-1"
            value={search}
            onChange={(value) => {
              setSearch(value);
              applyQuery(value.trim());
            }}
            placeholder="Buscar por nome ou número"
          />
          <Button
            size="icon"
            variant="outline"
            aria-label="Nova conversa"
            title="Nova conversa"
            disabled={!canStartConversation}
            onClick={onNewConversation}
          >
            <MessageCirclePlusIcon />
          </Button>
        </div>
        {isImporting && (
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <Spinner className="size-3" />
            Importando suas conversas…
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.isPending ? (
          <SectionSkeleton rows={6} />
        ) : conversations.isError ? (
          <p className="text-muted-foreground p-4 text-center text-sm">
            {getErrorMessage(conversations.error, "Não foi possível carregar as conversas.")}
          </p>
        ) : items.length === 0 ? (
          <div className="p-2">
            <SectionEmpty
              icon={SearchXIcon}
              title={query ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedId}
              />
            ))}
            <div ref={loadMoreRef} className="h-1 shrink-0" />
            {conversations.isFetchingNextPage && (
              <div className="flex justify-center p-2">
                <Spinner />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
