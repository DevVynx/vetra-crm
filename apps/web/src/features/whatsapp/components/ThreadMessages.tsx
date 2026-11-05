import type { WhatsappMessage } from "@vetra/contracts";
import { MessageCircleIcon } from "lucide-react";
import { Fragment } from "react";

import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Spinner } from "@/shared/components/ui/spinner";
import { MessageBubble } from "@/shared/components/whatsapp/MessageBubble";
import { useOnVisible } from "@/shared/hooks/useOnVisible";
import { cn } from "@/shared/utils/cn";
import { formatDayLabel } from "@/shared/utils/date";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

import { useWhatsappMessages } from "../queries/useWhatsappMessages";
import { type MessageActions, MessageMenu } from "./MessageMenu";

const startsNewDay = (message: WhatsappMessage, older: WhatsappMessage | undefined) =>
  !older || formatDayLabel(new Date(message.sentAt)) !== formatDayLabel(new Date(older.sentAt));

type ThreadMessagesProps = {
  conversationId: string;
  isConnected: boolean;
  actions: MessageActions;
  selection: ReadonlySet<string> | null;
  onToggleSelection: (message: WhatsappMessage) => void;
};

// Only the user's own messages can be deleted, so only those can be selected.
const isSelectable = (message: WhatsappMessage) =>
  message.direction === "outbound" && !message.isDeleted;

export function ThreadMessages({
  conversationId,
  isConnected,
  actions,
  selection,
  onToggleSelection,
}: ThreadMessagesProps) {
  const thread = useWhatsappMessages(conversationId);
  const messages = thread.data?.pages.flatMap((page) => page.messages) ?? [];

  const loadOlderRef = useOnVisible(() => {
    if (thread.hasNextPage && !thread.isFetchingNextPage) void thread.fetchNextPage();
  });

  if (thread.isPending) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 p-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="ml-auto h-10 w-1/3" />
        <Skeleton className="h-10 w-2/5" />
      </div>
    );
  }

  if (thread.isError) {
    return (
      <p className="text-muted-foreground flex-1 p-6 text-center text-sm">
        {getErrorMessage(thread.error, "Não foi possível carregar as mensagens.")}
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <SectionEmpty
          icon={MessageCircleIcon}
          title="Nenhuma mensagem ainda"
          description="Envie a primeira mensagem abaixo."
        />
      </div>
    );
  }

  // Newest first in a reversed column: the browser keeps it anchored at the bottom when a message
  // arrives, and keeps the reading position when older pages load above.
  return (
    <div className="flex min-h-0 flex-1 flex-col-reverse gap-1 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <Fragment key={message.id}>
          <div
            className={cn(
              "flex items-center gap-2 rounded-md",
              selection && isSelectable(message) && "hover:bg-muted/40 cursor-pointer",
              selection?.has(message.id) && "bg-primary/10"
            )}
            onClick={() => selection && isSelectable(message) && onToggleSelection(message)}
          >
            {selection && isSelectable(message) && (
              <Checkbox
                aria-label="Selecionar mensagem"
                checked={selection.has(message.id)}
                className="ml-1 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <MessageBubble
                message={message}
                actions={
                  selection ? undefined : (
                    <MessageMenu message={message} isConnected={isConnected} {...actions} />
                  )
                }
              />
            </div>
          </div>
          {startsNewDay(message, messages[index + 1]) && (
            <div className="flex justify-center py-2">
              <span className="bg-muted text-muted-foreground rounded-full px-3 py-0.5 text-xs">
                {formatDayLabel(new Date(message.sentAt))}
              </span>
            </div>
          )}
        </Fragment>
      ))}
      <div ref={loadOlderRef} className="h-1 shrink-0" />
      {thread.isFetchingNextPage && (
        <div className="flex justify-center p-2">
          <Spinner />
        </div>
      )}
    </div>
  );
}
