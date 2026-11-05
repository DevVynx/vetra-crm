import { Link } from "@tanstack/react-router";
import { WHATSAPP_DELETE_MAX_MESSAGES, type WhatsappMessage } from "@vetra/contracts";
import { ArrowLeftIcon, MessageCircleOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  conversationName,
  conversationSubtitle,
} from "@/shared/components/whatsapp/conversationName";
import { useIsPageActive } from "@/shared/hooks/useIsPageActive";

import { useDeleteWhatsappMessages } from "../mutations/useDeleteWhatsappMessages";
import { useMarkWhatsappConversationRead } from "../mutations/useMarkWhatsappConversationRead";
import { useWhatsappConversation } from "../queries/useWhatsappConversation";
import { ConversationActions } from "./ConversationActions";
import { MessageComposer } from "./MessageComposer";
import { SelectionBar } from "./SelectionBar";
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
  const [reply, setReply] = useState<WhatsappMessage | null>(null);
  const [editing, setEditing] = useState<WhatsappMessage | null>(null);
  const [selection, setSelection] = useState<ReadonlySet<string> | null>(null);
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const deleteMessages = useDeleteWhatsappMessages(conversationId);

  const toggleSelection = ({ id }: WhatsappMessage) => {
    const current = new Set(selection);

    if (current.delete(id)) return setSelection(current);
    if (current.size >= WHATSAPP_DELETE_MAX_MESSAGES) {
      return void toast.info(`Selecione até ${WHATSAPP_DELETE_MAX_MESSAGES} mensagens por vez.`);
    }

    setSelection(current.add(id));
  };

  const confirmDelete = () => {
    if (!toDelete) return;

    deleteMessages.mutate(
      { ids: toDelete },
      {
        onSuccess: () => {
          if (editing && toDelete.includes(editing.id)) setEditing(null);
          setSelection(null);
          setToDelete(null);
        },
        onError: () => setToDelete(null),
      }
    );
  };

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
  const subtitle = conversation ? conversationSubtitle(conversation) : null;

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
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{name}</span>
              {subtitle && (
                <span className="text-muted-foreground truncate text-xs">{subtitle}</span>
              )}
            </div>
            {conversation && <ConversationActions conversation={conversation} />}
          </>
        )}
      </header>

      <ThreadMessages
        key={conversationId}
        conversationId={conversationId}
        isConnected={isConnected}
        contact={conversation && { name, photoUrl: conversation.photoUrl }}
        selection={selection}
        onToggleSelection={toggleSelection}
        actions={{
          onReply: (message) => {
            setEditing(null);
            setReply(message);
          },
          onEdit: (message) => {
            setReply(null);
            setEditing(message);
          },
          onDelete: (message) => setToDelete([message.id]),
          onSelect: (message) => setSelection(new Set([message.id])),
        }}
      />
      {selection ? (
        <SelectionBar
          count={selection.size}
          isConnected={isConnected}
          onCancel={() => setSelection(null)}
          onDelete={() => setToDelete([...selection])}
        />
      ) : (
        <MessageComposer
          key={`composer-${conversationId}`}
          conversationId={conversationId}
          isConnected={isConnected}
          reply={reply}
          editing={editing}
          onDone={() => {
            setReply(null);
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={
          toDelete?.length === 1
            ? "Apagar mensagem para todos?"
            : `Apagar ${toDelete?.length} mensagens para todos?`
        }
        description="Ela some para você e para a pessoa no WhatsApp. Isso não pode ser desfeito."
        confirmLabel="Apagar para todos"
        destructive
        isPending={deleteMessages.isPending}
        ignoreEscape={deleteMessages.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
