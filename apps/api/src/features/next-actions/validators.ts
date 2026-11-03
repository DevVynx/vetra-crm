import {
  completeNextActionRequestSchema,
  createNextActionRequestSchema,
  leadParamsSchema,
  nextActionParamsSchema,
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
  completeNextAction: validation({
    params: nextActionParamsSchema,
    body: completeNextActionRequestSchema,
  }),
};

export default v;
