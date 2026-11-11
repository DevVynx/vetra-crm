import {
  createNextActionRequestSchema,
  leadParamsSchema,
  nextActionParamsSchema,
  restoreNextActionRequestSchema,
  resumeFollowUpsRequestSchema,
  sendNextActionRequestSchema,
  updateNextActionRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listNextActions: validation({}),
  listLeadNextActions: validation({ params: leadParamsSchema }),
  createNextAction: validation({ body: createNextActionRequestSchema }),
  updateNextAction: validation({
    params: nextActionParamsSchema,
    body: updateNextActionRequestSchema,
  }),
  completeNextAction: validation({ params: nextActionParamsSchema }),
  reopenNextAction: validation({ params: nextActionParamsSchema }),
  sendNextAction: validation({ params: nextActionParamsSchema, body: sendNextActionRequestSchema }),
  deleteNextAction: validation({ params: nextActionParamsSchema }),
  restoreNextAction: validation({ body: restoreNextActionRequestSchema }),
  cancelFollowUps: validation({ params: leadParamsSchema }),
  resumeFollowUps: validation({ params: leadParamsSchema, body: resumeFollowUpsRequestSchema }),
};

export default v;
