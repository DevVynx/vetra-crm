import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, MessageCircleOffIcon } from "lucide-react";
import { useEffect } from "react";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useIsPageActive } from "@/shared/hooks/useIsPageActive";
import { formatPhone } from "@/shared/utils/format";

import { useMarkWhatsappConversationRead } from "../mutations/useMarkWhatsappConversationRead";
import { useWhatsappConversation } from "../queries/useWhatsappConversation";
import { conversationName } from "../utils/conversationName";
import { MessageComposer } from "./MessageComposer";
import { ThreadMessages } from "./ThreadMessages";

type ConversationThreadProps = {
  conversationId: string;
  isConnected: boolean;
};

export function ConversationThread({ conversationId, isConnected }: ConversationThreadProps) {
  const { data: conversation, isPending, isError } = useWhatsappConversation(conversationId);
  const { mutate: markRead } = useMarkWhatsappConversationRead();
  const isPageActive = useIsPageActive();
  const hasUnread = (conversation?.unreadCount ?? 0) > 0;

  // Only while really being used: a tab or window in the background must not show the blue ticks.
  useEffect(() => {
    if (hasUnread && isPageActive) markRead(conversationId);
  }, [conversationId, hasUnread, isPageActive, markRead]);

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <SectionEmpty icon={MessageCircleOffIcon} title="Conversa não encontrada" />
      </div>
    );
  }

  const name = conversation ? conversationName(conversation) : "";
  const phone = conversation?.phone ? formatPhone(conversation.phone) : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b p-3">
        <Button
          className="md:hidden"
          size="icon-sm"
          variant="ghost"
          aria-label="Voltar para as conversas"
          nativeButton={false}
          render={<Link to="/whatsapp" />}
        >
          <ArrowLeftIcon />
        </Button>
        {isPending ? (
          <>
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : (
          <>
            <BusinessAvatar
              name={name}
              photoUrl={conversation?.photoUrl ?? undefined}
              className="size-10 shrink-0"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{name}</span>
              {phone && phone !== name && (
                <span className="text-muted-foreground truncate text-xs">{phone}</span>
              )}
            </div>
          </>
        )}
      </header>

      <ThreadMessages key={conversationId} conversationId={conversationId} />
      <MessageComposer
        key={`composer-${conversationId}`}
        conversationId={conversationId}
        isConnected={isConnected}
      />
    </div>
  );
}
