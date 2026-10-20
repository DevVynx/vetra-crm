import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/shared/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/")({
  staticData: { title: "Hoje" },
  component: () => (
    <PagePlaceholder description="Seus follow-ups e próximas ações aparecerão aqui." />
  ),
});
