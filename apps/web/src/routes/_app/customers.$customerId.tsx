import { createFileRoute } from "@tanstack/react-router";

import { CustomerDetailPage } from "@/features/customers/components/CustomerDetailPage";

export const Route = createFileRoute("/_app/customers/$customerId")({
  staticData: { parent: { label: "Clientes", to: "/customers" } },
  component: CustomerDetailPage,
});
