import { WHATSAPP_MESSAGE_MAX_LENGTH, type WhatsappMessage } from "@vetra/contracts";
import { PencilIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { QuotedMessage } from "@/shared/components/whatsapp/MessageBubble";

import { useEditWhatsappMessage } from "../mutations/useEditWhatsappMessage";
import { useSendWhatsappMessage } from "../mutations/useSendWhatsappMessage";

type MessageComposerProps = {
  conversationId: string;
  isConnected: boolean;
  reply: WhatsappMessage | null;
  editing: WhatsappMessage | null;
  onDone: () => void;
};

export function MessageComposer({
  conversationId,
  isConnected,
  reply,
  editing,
  onDone,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const send = useSendWhatsappMessage(conversationId);
  const edit = useEditWhatsappMessage(conversationId);
  const isPending = send.isPending || edit.isPending;
  const hasText = text.trim().length > 0;
  const isChanged = !editing || text.trim() !== editing.content;
  const canSend = isConnected && hasText && isChanged && !isPending;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Not on touch screens, where the keyboard would open by itself and cover the messages.
  useEffect(() => {
    if (isConnected && !window.matchMedia("(pointer: coarse)").matches) {
      textareaRef.current?.focus();
    }
  }, [isConnected]);

  useEffect(() => {
    if (!editing) return;

    setText(editing.content ?? "");
    textareaRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (reply) textareaRef.current?.focus();
  }, [reply]);

  const cancel = () => {
    if (editing) setText("");
    onDone();
  };

  const submit = () => {
    if (!canSend) return;
    textareaRef.current?.focus();
    const finish = () => {
      setText("");
      onDone();
    };

    // The text only clears once sent, so a failure never loses what was written.
    if (editing) edit.mutate({ messageId: editing.id, text: text.trim() }, { onSuccess: finish });
    else send.mutate({ text: text.trim(), replyTo: reply?.id }, { onSuccess: finish });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && (reply || editing)) return cancel();
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  };

  const context = editing ? (
    <div className="flex min-w-0 flex-col gap-0.5 text-xs">
      <span className="text-primary flex items-center gap-1 font-medium">
        <PencilIcon className="size-3" />
        Editando mensagem
      </span>
      <span className="text-muted-foreground line-clamp-1 break-words">{editing.content}</span>
    </div>
  ) : (
    reply && (
      <QuotedMessage
        replyTo={{
          content: reply.isDeleted ? null : reply.content,
          direction: reply.direction,
        }}
      />
    )
  );

  return (
    <div className="border-t">
      {context && (
        <div className="flex items-start gap-2 px-3 pt-3">
          <div className="min-w-0 flex-1">{context}</div>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={editing ? "Cancelar edição" : "Cancelar resposta"}
            onClick={cancel}
          >
            <XIcon />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <Textarea
          ref={textareaRef}
          aria-label="Mensagem"
          rows={1}
          className="max-h-32 min-h-9 resize-none read-only:opacity-60"
          // Read-only instead of disabled while sending: a disabled field would lose the focus.
          readOnly={isPending}
          maxLength={WHATSAPP_MESSAGE_MAX_LENGTH}
          placeholder={isConnected ? "Escreva uma mensagem" : "Conecte o WhatsApp para enviar"}
          disabled={!isConnected}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button
          size="icon"
          aria-label={editing ? "Salvar edição" : "Enviar mensagem"}
          disabled={!canSend}
          onClick={submit}
        >
          {isPending ? <Spinner /> : <SendHorizontalIcon />}
        </Button>
      </div>
    </div>
  );
}
