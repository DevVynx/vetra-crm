import {
  createLeadRequestSchema,
  filterOptionsQuerySchema,
  leadParamsSchema,
  listLeadsQuerySchema,
  restoreLeadStagesRequestSchema,
  updateLeadRequestSchema,
  updateLeadsStageRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listLeads: validation({ query: listLeadsQuerySchema }),
  getLeadFilterOptions: validation({ query: filterOptionsQuerySchema }),
  getLead: validation({ params: leadParamsSchema }),
  createLead: validation({ body: createLeadRequestSchema }),
  updateLead: validation({ params: leadParamsSchema, body: updateLeadRequestSchema }),
  deleteLead: validation({ params: leadParamsSchema }),
  updateLeadsStage: validation({ body: updateLeadsStageRequestSchema }),
  restoreLeadStages: validation({ body: restoreLeadStagesRequestSchema }),
  listLeadsWithoutNextAction: validation({}),
};

export default v;
