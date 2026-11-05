import { Link } from "@tanstack/react-router";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Button } from "@/shared/components/ui/button";

export function WhatsAppButton({ leadId }: { leadId: string }) {
  return (
    <Button
      variant="outline"
      className="dark:bg-background font-semibold"
      title="Abrir conversa no WhatsApp"
      nativeButton={false}
      render={<Link to="/whatsapp" search={{ leadId }} />}
    >
      <WhatsAppIcon />
      WhatsApp
    </Button>
  );
}
