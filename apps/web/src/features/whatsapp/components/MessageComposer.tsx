import { WHATSAPP_MESSAGE_MAX_LENGTH } from "@vetra/contracts";
import { SendHorizontalIcon } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";

import { useSendWhatsappMessage } from "../mutations/useSendWhatsappMessage";

type MessageComposerProps = {
  conversationId: string;
  isConnected: boolean;
};

export function MessageComposer({ conversationId, isConnected }: MessageComposerProps) {
  const [text, setText] = useState("");
  const send = useSendWhatsappMessage(conversationId);
  const canSend = isConnected && text.trim().length > 0 && !send.isPending;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Not on touch screens, where the keyboard would open by itself and cover the messages.
  useEffect(() => {
    if (isConnected && !window.matchMedia("(pointer: coarse)").matches) {
      textareaRef.current?.focus();
    }
  }, [isConnected]);

  const submit = () => {
    if (!canSend) return;
    textareaRef.current?.focus();
    // The text only clears once sent, so a failure never loses what was written.
    send.mutate({ text: text.trim() }, { onSuccess: () => setText("") });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  };

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <Textarea
        ref={textareaRef}
        aria-label="Mensagem"
        rows={1}
        className="max-h-32 min-h-9 resize-none read-only:opacity-60"
        // Read-only instead of disabled while sending: a disabled field would lose the focus.
        readOnly={send.isPending}
        maxLength={WHATSAPP_MESSAGE_MAX_LENGTH}
        placeholder={isConnected ? "Escreva uma mensagem" : "Conecte o WhatsApp para enviar"}
        disabled={!isConnected}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button size="icon" aria-label="Enviar mensagem" disabled={!canSend} onClick={submit}>
        {send.isPending ? <Spinner /> : <SendHorizontalIcon />}
      </Button>
    </div>
  );
}
