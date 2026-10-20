import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/shared/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/leads")({
  staticData: { title: "Leads" },
  component: () => <PagePlaceholder description="Seus leads aparecerão aqui." />,
});
