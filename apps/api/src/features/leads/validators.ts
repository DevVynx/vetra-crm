import {
  createLeadRequestSchema,
  filterOptionsQuerySchema,
  leadParamsSchema,
  leadSlugParamsSchema,
  listLeadIdsQuerySchema,
  listLeadsQuerySchema,
  lookupLeadsQuerySchema,
  restoreLeadStagesRequestSchema,
  updateLeadDoNotContactRequestSchema,
  updateLeadRequestSchema,
  updateLeadsStageRequestSchema,
  upsertLeadBySlugRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listLeads: validation({ query: listLeadsQuerySchema }),
  listLeadIds: validation({ query: listLeadIdsQuerySchema }),
  getLeadFilterOptions: validation({ query: filterOptionsQuerySchema }),
  getLead: validation({ params: leadParamsSchema }),
  lookupLeads: validation({ query: lookupLeadsQuerySchema }),
  upsertLeadBySlug: validation({
    params: leadSlugParamsSchema,
    body: upsertLeadBySlugRequestSchema,
  }),
  updateLeadDoNotContact: validation({
    params: leadParamsSchema,
    body: updateLeadDoNotContactRequestSchema,
  }),
  createLead: validation({ body: createLeadRequestSchema }),
  updateLead: validation({ params: leadParamsSchema, body: updateLeadRequestSchema }),
  deleteLead: validation({ params: leadParamsSchema }),
  updateLeadsStage: validation({ body: updateLeadsStageRequestSchema }),
  restoreLeadStages: validation({ body: restoreLeadStagesRequestSchema }),
  listLeadsWithoutNextAction: validation({}),
};

export default v;
