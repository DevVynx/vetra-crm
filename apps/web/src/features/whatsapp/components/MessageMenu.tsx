import type { WhatsappMessage } from "@vetra/contracts";
import {
  ChevronDownIcon,
  CopyIcon,
  ListChecksIcon,
  PencilIcon,
  ReplyIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export type MessageActions = {
  onReply: (message: WhatsappMessage) => void;
  onEdit: (message: WhatsappMessage) => void;
  onDelete: (message: WhatsappMessage) => void;
  onSelect: (message: WhatsappMessage) => void;
};

type MessageMenuProps = MessageActions & {
  message: WhatsappMessage;
  isConnected: boolean;
};

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Mensagem copiada.");
  } catch {
    toast.error("Não foi possível copiar a mensagem.");
  }
}

export function MessageMenu({
  message,
  isConnected,
  onReply,
  onEdit,
  onDelete,
  onSelect,
}: MessageMenuProps) {
  if (message.isDeleted) return null;

  const isOwn = message.direction === "outbound";
  const canEdit = isOwn && message.type === "text" && message.content !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Ações da mensagem"
            title="Ações da mensagem"
            className="bg-card/80 hover:bg-card"
          >
            <ChevronDownIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!isConnected} onClick={() => onReply(message)}>
          <ReplyIcon />
          Responder
        </DropdownMenuItem>
        {message.content && (
          <DropdownMenuItem onClick={() => void copy(message.content ?? "")}>
            <CopyIcon />
            Copiar
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem disabled={!isConnected} onClick={() => onEdit(message)}>
            <PencilIcon />
            Editar
          </DropdownMenuItem>
        )}
        {isOwn && (
          <>
            <DropdownMenuItem onClick={() => onSelect(message)}>
              <ListChecksIcon />
              Selecionar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!isConnected}
              onClick={() => onDelete(message)}
            >
              <Trash2Icon />
              Apagar para todos
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
