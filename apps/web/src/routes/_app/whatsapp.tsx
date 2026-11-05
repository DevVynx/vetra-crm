import { createFileRoute } from "@tanstack/react-router";

import { WhatsAppPage } from "@/features/whatsapp/components/WhatsAppPage";

export const Route = createFileRoute("/_app/whatsapp")({
  staticData: { title: "WhatsApp" },
  component: WhatsAppPage,
});
