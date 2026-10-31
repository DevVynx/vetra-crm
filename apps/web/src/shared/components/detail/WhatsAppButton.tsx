import { Link } from "@tanstack/react-router";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";
import { Button } from "@/shared/components/ui/button";

export function WhatsAppButton() {
  return (
    <Button
      variant="outline"
      className="dark:bg-background font-semibold"
      title="Abrir conversas do WhatsApp"
      nativeButton={false}
      render={<Link to="/whatsapp" />}
    >
      <WhatsAppIcon />
      WhatsApp
    </Button>
  );
}
