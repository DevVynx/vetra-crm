import { createFileRoute } from "@tanstack/react-router";
import { filterSchema } from "@vetra/contracts";
import { z } from "zod";

import { CustomerDetailPage } from "@/features/customers/components/CustomerDetailPage";

// Filters of the ledger tab, kept in the URL like the list pages do.
const searchSchema = z.object({
  filters: z.array(filterSchema).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/customers/$customerId")({
  staticData: { parent: { label: "Clientes", to: "/customers" } },
  validateSearch: searchSchema,
  component: CustomerDetailPage,
});
