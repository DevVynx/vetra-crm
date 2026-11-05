import { Link } from "@tanstack/react-router";
import type { WhatsappConversation } from "@vetra/contracts";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { Badge } from "@/shared/components/ui/badge";
import { MessageStatusIcon } from "@/shared/components/whatsapp/MessageStatusIcon";
import { nonTextMessageLabels } from "@/shared/components/whatsapp/messageTypeLabels";
import { cn } from "@/shared/utils/cn";
import { formatConversationTime } from "@/shared/utils/date";

import { conversationName } from "../utils/conversationName";

function LastMessagePreview({ conversation }: { conversation: WhatsappConversation }) {
  const { lastMessage } = conversation;
  if (!lastMessage) return null;

  const nonText = lastMessage.type === "text" ? null : nonTextMessageLabels[lastMessage.type];

  return (
    <span className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs">
      {lastMessage.status ? (
        <MessageStatusIcon status={lastMessage.status} />
      ) : (
        lastMessage.direction === "outbound" && <span className="shrink-0">Você:</span>
      )}
      {nonText && <nonText.icon className="size-3.5 shrink-0" />}
      <span className="truncate">{lastMessage.content ?? nonText?.label}</span>
    </span>
  );
}

type ConversationListItemProps = {
  conversation: WhatsappConversation;
  isActive: boolean;
};

export function ConversationListItem({ conversation, isActive }: ConversationListItemProps) {
  const name = conversationName(conversation);
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Link
      to="/whatsapp"
      search={{ conversation: conversation.id }}
      className={cn(
        "hover:bg-muted/50 focus-visible:bg-muted/50 flex items-center gap-3 rounded-lg p-2 outline-none",
        isActive && "bg-accent hover:bg-accent focus-visible:bg-accent"
      )}
    >
      <BusinessAvatar
        name={name}
        photoUrl={conversation.photoUrl ?? undefined}
        className="size-10 shrink-0"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm", hasUnread ? "font-semibold" : "font-medium")}>
            {name}
          </span>
          {conversation.lastMessageAt && (
            <span
              className={cn(
                "shrink-0 text-xs",
                hasUnread ? "text-success font-medium" : "text-muted-foreground"
              )}
            >
              {formatConversationTime(new Date(conversation.lastMessageAt))}
            </span>
          )}
        </span>
        <span className="flex items-center justify-between gap-2">
          <LastMessagePreview conversation={conversation} />
          {hasUnread && (
            <Badge variant="success" className="shrink-0">
              {conversation.unreadCount}
            </Badge>
          )}
        </span>
      </span>
    </Link>
  );
}
