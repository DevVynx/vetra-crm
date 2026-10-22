import { createFileRoute } from "@tanstack/react-router";
import { customerListFilterSchema } from "@vetra/contracts";
import { z } from "zod";

import { CustomersPage } from "@/features/customers/components/CustomersPage";

// Optional, with the defaults applied by the page: defaults in the schema would be written
// into the URL as soon as any param changes.
const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  filter: customerListFilterSchema.optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/customers/")({
  staticData: { title: "Clientes" },
  validateSearch: searchSchema,
  component: CustomersPage,
});
