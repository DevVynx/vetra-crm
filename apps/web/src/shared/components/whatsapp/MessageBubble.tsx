import type { WhatsappMessage } from "@vetra/contracts";

import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatTime } from "@/shared/utils/date";

import { MessageStatusIcon } from "./MessageStatusIcon";
import { nonTextMessageLabels } from "./messageTypeLabels";

type MessageBubbleProps = {
  message: WhatsappMessage;
  compact?: boolean;
};

function MessageMeta({ message, compact }: Required<MessageBubbleProps>) {
  const sentAt = new Date(message.sentAt);
  const day = formatDayLabel(sentAt);

  return (
    <span className="text-muted-foreground inline-flex items-end gap-1 text-[11px] leading-none whitespace-nowrap">
      {compact && day !== "Hoje" && `${day} · `}
      {formatTime(sentAt)}
      {message.status && <MessageStatusIcon status={message.status} />}
    </span>
  );
}

export function MessageBubble({ message, compact = false }: MessageBubbleProps) {
  const isOutbound = message.direction === "outbound";
  const nonText = message.type === "text" ? null : nonTextMessageLabels[message.type];
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
          "relative flex max-w-[85%] flex-col gap-1 rounded-lg px-2.5 py-1.5 text-sm",
          isOutbound ? "bg-primary/15 rounded-br-sm" : "bg-muted rounded-bl-sm"
        )}
      >
        {nonText && (
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
        {compact ? (
          <span className="self-end">{meta}</span>
        ) : (
          <span className="absolute right-2 bottom-1.5 flex">{meta}</span>
        )}
      </div>
    </div>
  );
}
