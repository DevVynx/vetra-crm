import { WHATSAPP_MESSAGE_MAX_LENGTH, type WhatsappMessage } from "@vetra/contracts";
import { MicIcon, PencilIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { QuotedMessage } from "@/shared/components/whatsapp/MessageBubble";

import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useEditWhatsappMessage } from "../mutations/useEditWhatsappMessage";
import { useSendWhatsappMessage } from "../mutations/useSendWhatsappMessage";
import { useSendWhatsappVoice } from "../mutations/useSendWhatsappVoice";
import { voiceRecorderProblemMessage } from "../utils/whatsappErrors";
import { AttachButton } from "./AttachButton";
import { useThreadAttachments } from "./ThreadAttachments";
import { VoiceRecorderBar } from "./VoiceRecorderBar";

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
  const attachments = useThreadAttachments();
  const hasFiles = !editing && attachments.files.length > 0;
  const sendVoice = useSendWhatsappVoice(conversationId);
  const recorder = useVoiceRecorder();
  const { cancel: cancelRecording } = recorder;
  const isPending =
    send.isPending || edit.isPending || attachments.isSending || sendVoice.isPending;
  const hasText = text.trim().length > 0;
  const isChanged = !editing || text.trim() !== editing.content;
  const canSend = isConnected && !isPending && ((hasText && isChanged) || hasFiles);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingState = recorder.state;
  const isRecording = recordingState.phase !== "idle";
  // The microphone takes the place of send while there is nothing to send, like in WhatsApp.
  const showsMicrophone = !isRecording && !hasText && !hasFiles && !editing;

  // A recording belongs to the conversation it started in: leaving it drops it.
  useEffect(() => cancelRecording, [conversationId, cancelRecording]);

  useEffect(() => {
    if (!isRecording || sendVoice.isPending) return;

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") cancelRecording();
    };
    document.addEventListener("keydown", onEscape);

    return () => document.removeEventListener("keydown", onEscape);
  }, [isRecording, sendVoice.isPending, cancelRecording]);

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

  const submit = async () => {
    if (!canSend) return;
    textareaRef.current?.focus();
    const finish = () => {
      setText("");
      onDone();
    };

    // Files go first; the text only follows when they all went.
    if (hasFiles && !(await attachments.send())) return;
    if (!hasText) return;

    // The text only clears once sent, so a failure never loses what was written.
    if (editing) edit.mutate({ messageId: editing.id, text: text.trim() }, { onSuccess: finish });
    else send.mutate({ text: text.trim(), replyTo: reply?.id }, { onSuccess: finish });
  };

  const startRecording = async () => {
    const problem = await recorder.start();
    if (problem) toast.error(voiceRecorderProblemMessage(problem));
  };

  // A failure leaves the recording as it was, stopped, so sending can be tried again.
  const sendRecording = async () => {
    const recording = await recorder.finish();
    if (!recording) return;
    if (recording.seconds < 1) return cancelRecording();

    sendVoice.mutate(
      { blob: recording.blob, seconds: Math.round(recording.seconds), replyTo: reply?.id },
      {
        onSuccess: () => {
          cancelRecording();
          onDone();
        },
      }
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && (reply || editing)) return cancel();
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    void submit();
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
      {recordingState.phase !== "idle" ? (
        <VoiceRecorderBar
          state={recordingState}
          isSending={sendVoice.isPending}
          onCancel={cancelRecording}
          onSend={() => void sendRecording()}
        />
      ) : (
        <div className="flex items-end gap-2 p-3">
          <AttachButton />
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
          {showsMicrophone ? (
            <Button
              size="icon"
              aria-label="Gravar áudio"
              disabled={!isConnected || isPending}
              onClick={() => void startRecording()}
            >
              <MicIcon />
            </Button>
          ) : (
            <Button
              size="icon"
              aria-label={
                editing ? "Salvar edição" : hasFiles ? "Enviar arquivos" : "Enviar mensagem"
              }
              disabled={!canSend}
              onClick={() => void submit()}
            >
              {isPending ? <Spinner /> : <SendHorizontalIcon />}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
