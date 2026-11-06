import { ZapIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";

export function AutoSendBadge() {
  return (
    <Badge variant="secondary">
      <ZapIcon />
      Envio automático
    </Badge>
  );
}
