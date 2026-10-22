import { createFileRoute } from "@tanstack/react-router";

import { LeadDetailPage } from "@/features/leads/components/LeadDetailPage";

export const Route = createFileRoute("/_app/leads/$leadId")({
  staticData: { parent: { label: "Leads", to: "/leads" } },
  component: LeadDetailPage,
});
