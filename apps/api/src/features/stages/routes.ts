import { stagesRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  countLeadsPerStageController,
  createStageController,
  deleteStageController,
  listStagesController,
  reorderStagesController,
  updateStageController,
} from "./controllers";
import v from "./validators";

export const stagesRouter: Router = Router();

stagesRouter.get(stagesRoutes.base, v.listStages, listStagesController);
stagesRouter.post(stagesRoutes.base, v.createStage, createStageController);
stagesRouter.get(stagesRoutes.leadCounts, v.countLeadsPerStage, countLeadsPerStageController);
stagesRouter.put(stagesRoutes.order, v.reorderStages, reorderStagesController);
stagesRouter.patch(stagesRoutes.byId, v.updateStage, updateStageController);
stagesRouter.delete(stagesRoutes.byId, v.deleteStage, deleteStageController);
