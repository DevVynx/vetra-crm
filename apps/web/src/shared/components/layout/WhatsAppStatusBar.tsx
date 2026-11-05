import { Link } from "@tanstack/react-router";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Badge } from "@/shared/components/ui/badge";
import { useWhatsappStatus } from "@/shared/queries/whatsapp/useWhatsappStatus";

export function WhatsAppStatusBar() {
  const { data, isPending, isError } = useWhatsappStatus();
  const isConnected = !isError && data?.status === "connected";

  return (
    <footer className="bg-sidebar flex shrink-0 justify-end px-2 py-1.5">
      <Badge
        variant={isPending ? "secondary" : isConnected ? "success" : "destructive"}
        className="h-6 gap-1.5 border-current/40 px-2.5 hover:brightness-125 [&>svg]:size-3.5!"
        render={<Link to="/whatsapp" />}
      >
        <WhatsAppIcon />
        {isPending ? "WhatsApp" : isConnected ? "WhatsApp conectado" : "WhatsApp desconectado"}
      </Badge>
    </footer>
  );
}
