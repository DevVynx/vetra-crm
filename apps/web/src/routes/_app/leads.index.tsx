import { createFileRoute } from "@tanstack/react-router";
import { filterSchema } from "@vetra/contracts";
import { z } from "zod";

import { LeadsPage } from "@/features/leads/components/LeadsPage";

// Optional, with the defaults applied by the page: defaults in the schema would be written
// into the URL as soon as any param changes.
const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  filters: z.array(filterSchema).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/leads/")({
  staticData: { title: "Leads" },
  validateSearch: searchSchema,
  component: LeadsPage,
});
