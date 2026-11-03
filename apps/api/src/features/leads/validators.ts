import {
  createLeadRequestSchema,
  filterOptionsQuerySchema,
  leadParamsSchema,
  listLeadsQuerySchema,
  restoreLeadStagesRequestSchema,
  updateLeadRequestSchema,
  updateLeadsStageRequestSchema,
  updateLeadStageRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listLeads: validation({ query: listLeadsQuerySchema }),
  getLeadFilterOptions: validation({ query: filterOptionsQuerySchema }),
  getLead: validation({ params: leadParamsSchema }),
  createLead: validation({ body: createLeadRequestSchema }),
  updateLead: validation({ params: leadParamsSchema, body: updateLeadRequestSchema }),
  deleteLead: validation({ params: leadParamsSchema }),
  updateLeadStage: validation({ params: leadParamsSchema, body: updateLeadStageRequestSchema }),
  updateLeadsStage: validation({ body: updateLeadsStageRequestSchema }),
  restoreLeadStages: validation({ body: restoreLeadStagesRequestSchema }),
};

export default v;
