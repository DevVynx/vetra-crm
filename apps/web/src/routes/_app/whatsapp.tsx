import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { WhatsAppPage } from "@/features/whatsapp/components/WhatsAppPage";

const searchSchema = z.object({
  conversation: z.string().optional().catch(undefined),
  leadId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/whatsapp")({
  staticData: { title: "WhatsApp" },
  validateSearch: searchSchema,
  component: WhatsAppPage,
});
