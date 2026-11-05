import type { WhatsappMessage } from "@vetra/contracts";
import { BanIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatTime } from "@/shared/utils/date";

import { MessageMedia, OPENABLE_MEDIA_TYPES } from "./MessageMedia";
import { MessageStatusIcon } from "./MessageStatusIcon";
import { nonTextMessageLabels } from "./messageTypeLabels";

type MessageBubbleProps = {
  message: WhatsappMessage;
  compact?: boolean;
  actions?: ReactNode;
  // Where the file is asked for: only the thread opens media, the lead's card just names it.
  conversationId?: string;
};

function MessageMeta({ message, compact }: { message: WhatsappMessage; compact: boolean }) {
  const sentAt = new Date(message.sentAt);
  const day = formatDayLabel(sentAt);

  return (
    <span className="text-muted-foreground inline-flex items-end gap-1 text-[11px] leading-none whitespace-nowrap">
      {message.editedAt && !message.isDeleted && "editada · "}
      {compact && day !== "Hoje" && `${day} · `}
      {formatTime(sentAt)}
      {message.status && !message.isDeleted && <MessageStatusIcon status={message.status} />}
    </span>
  );
}

export function QuotedMessage({ replyTo }: { replyTo: NonNullable<WhatsappMessage["replyTo"]> }) {
  const isOwn = replyTo.direction === "outbound";

  return (
    <div
      className={cn(
        "bg-background/40 flex min-w-0 flex-col gap-0.5 rounded-md border-l-2 px-2 py-1 text-xs",
        isOwn ? "border-primary" : "border-muted-foreground"
      )}
    >
      {replyTo.direction && (
        <span className={cn("font-medium", isOwn ? "text-primary" : "text-muted-foreground")}>
          {isOwn ? "Você" : "Contato"}
        </span>
      )}
      <span className="text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap">
        {replyTo.content ?? "Mídia"}
      </span>
    </div>
  );
}

export function MessageBubble({
  message,
  compact = false,
  actions,
  conversationId,
}: MessageBubbleProps) {
  const isOutbound = message.direction === "outbound";
  const nonText = message.type === "text" ? null : nonTextMessageLabels[message.type];
  const isOpenable =
    Boolean(conversationId) &&
    !compact &&
    (OPENABLE_MEDIA_TYPES as readonly string[]).includes(message.type);
  const meta = <MessageMeta message={message} compact={compact} />;
  // An invisible copy reserves the room at the end of the last line, so the text flows around the
  // time like on WhatsApp: beside it when it fits, and on a line of its own when it doesn't.
  const reservedRoom = !compact && (
    <span aria-hidden className="invisible ml-2 inline-block align-baseline">
      {meta}
    </span>
  );

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "group/message relative flex max-w-[85%] flex-col gap-1 rounded-lg px-2.5 py-1.5 text-sm",
          isOutbound ? "bg-primary/15 rounded-br-sm" : "bg-muted rounded-bl-sm"
        )}
      >
        {actions && (
          <div className="absolute top-0.5 right-0.5 z-10 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100">
            {actions}
          </div>
        )}
        {!compact && message.replyTo && !message.isDeleted && (
          <QuotedMessage replyTo={message.replyTo} />
        )}
        {message.isDeleted ? (
          <p className="text-muted-foreground flex items-center gap-1.5 italic">
            <BanIcon className="size-3.5" />
            Mensagem apagada
            {reservedRoom}
          </p>
        ) : (
          <>
            {isOpenable && conversationId && (
              <>
                <MessageMedia conversationId={conversationId} message={message} />
                {!message.content && <span aria-hidden className="block h-3" />}
              </>
            )}
            {nonText && !isOpenable && (
              <span className="text-muted-foreground flex items-center gap-1.5">
                <nonText.icon className="size-3.5" />
                {nonText.label}
                {!message.content && reservedRoom}
              </span>
            )}
            {message.content && (
              <p className={cn(compact ? "line-clamp-2" : "break-words whitespace-pre-wrap")}>
                {message.content}
                {reservedRoom}
              </p>
            )}
          </>
        )}
        {compact ? (
          <span className="self-end">{meta}</span>
        ) : (
          <span className="absolute right-2 bottom-1.5 flex">{meta}</span>
        )}
      </div>
    </div>
  );
}
