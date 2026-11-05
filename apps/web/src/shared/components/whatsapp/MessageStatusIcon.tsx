import type { WhatsappMessageStatus } from "@vetra/contracts";
import { CheckCheckIcon, CheckIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

const LABELS: Record<WhatsappMessageStatus, string> = {
  sent: "Enviada",
  delivered: "Entregue",
  read: "Lida",
};

export function MessageStatusIcon({ status }: { status: WhatsappMessageStatus }) {
  const Icon = status === "sent" ? CheckIcon : CheckCheckIcon;

  return (
    <Icon
      role="img"
      aria-label={LABELS[status]}
      className={cn("size-3.5 shrink-0", status === "read" ? "text-info" : "text-muted-foreground")}
    />
  );
}
