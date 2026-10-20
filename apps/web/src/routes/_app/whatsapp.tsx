import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/shared/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/whatsapp")({
  staticData: { title: "WhatsApp" },
  component: () => <PagePlaceholder description="Suas conversas do WhatsApp aparecerão aqui." />,
});
