import { BanIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";

export function DoNotContactBadge() {
  return (
    <Badge variant="destructive">
      <BanIcon />
      Não contatar
    </Badge>
  );
}
