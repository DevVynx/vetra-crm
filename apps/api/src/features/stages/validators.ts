import {
  createStageRequestSchema,
  reorderStagesRequestSchema,
  stageParamsSchema,
  updateStageRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listStages: validation({}),
  countLeadsPerStage: validation({}),
  createStage: validation({ body: createStageRequestSchema }),
  updateStage: validation({ params: stageParamsSchema, body: updateStageRequestSchema }),
  reorderStages: validation({ body: reorderStagesRequestSchema }),
  deleteStage: validation({ params: stageParamsSchema }),
};

export default v;
