import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/shared/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/dashboard")({
  staticData: { title: "Dashboard" },
  component: () => <PagePlaceholder description="A visão geral do seu funil aparecerá aqui." />,
});
