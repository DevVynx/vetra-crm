import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/shared/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/configuracoes")({
  staticData: { title: "Configurações" },
  component: () => <PagePlaceholder description="As configurações do Vetra aparecerão aqui." />,
});
