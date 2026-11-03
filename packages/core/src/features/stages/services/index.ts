import { countLeadsPerStage } from "./countLeadsPerStage";
import { createStage } from "./createStage";
import { deleteStage } from "./deleteStage";
import { ensureStages } from "./ensureStages";
import { listStages } from "./listStages";
import { reorderStages } from "./reorderStages";
import { updateStage } from "./updateStage";

export const stageServices = {
  countLeadsPerStage,
  createStage,
  deleteStage,
  ensureStages,
  listStages,
  reorderStages,
  updateStage,
};
