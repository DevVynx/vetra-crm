import type { WhatsappMessage, WhatsappMessageType } from "@vetra/contracts";
import { FileTextIcon, ImageIcon, MicIcon } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatTime } from "@/shared/utils/date";

const nonTextLabels: Record<
  Exclude<WhatsappMessageType, "text">,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  audio: { label: "Áudio", icon: MicIcon },
  image: { label: "Imagem", icon: ImageIcon },
  document: { label: "Documento", icon: FileTextIcon },
};

export function MessageBubble({ message }: { message: WhatsappMessage }) {
  const sentAt = new Date(message.sentAt);
  const isOutbound = message.direction === "outbound";
  const nonText = message.type === "text" ? null : nonTextLabels[message.type];
  const day = formatDayLabel(sentAt);

  return (
    <div className={cn("flex flex-col gap-0.5", isOutbound ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-1.5 text-sm",
          isOutbound ? "bg-primary/10" : "bg-muted"
        )}
      >
        {nonText ? (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <nonText.icon className="size-3.5" />
            {nonText.label}
          </span>
        ) : (
          <p className="line-clamp-2">{message.content}</p>
        )}
      </div>
      <span className="text-muted-foreground text-xs">
        {day === "Hoje" ? "" : `${day} · `}
        {formatTime(sentAt)}
      </span>
    </div>
  );
}
