import { createFileRoute } from "@tanstack/react-router";
import { customerSortFields, filterSchema, sortDirectionSchema } from "@vetra/contracts";
import { z } from "zod";

import { CustomersPage } from "@/features/customers/components/CustomersPage";

// Optional, with the defaults applied by the page: defaults in the schema would be written
// into the URL as soon as any param changes.
const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  filters: z.array(filterSchema).optional().catch(undefined),
  sort: z.enum(customerSortFields).optional().catch(undefined),
  direction: sortDirectionSchema.optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/customers/")({
  staticData: { title: "Clientes" },
  validateSearch: searchSchema,
  component: CustomersPage,
});
