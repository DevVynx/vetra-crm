import { dashboardRoutes, leadsRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  createLeadController,
  deleteLeadController,
  getLeadController,
  getLeadFilterOptionsController,
  listLeadsController,
  listLeadsWithoutNextActionController,
  restoreLeadStagesController,
  updateLeadController,
  updateLeadsStageController,
  updateLeadStageController,
} from "./controllers";
import v from "./validators";

export const leadsRouter: Router = Router();

leadsRouter.get(leadsRoutes.base, v.listLeads, listLeadsController);
leadsRouter.post(leadsRoutes.base, v.createLead, createLeadController);
// Fixed paths go before /leads/:id, otherwise "filter-options" and "stage" would be read as ids.
leadsRouter.get(leadsRoutes.filterOptions, v.getLeadFilterOptions, getLeadFilterOptionsController);
leadsRouter.patch(leadsRoutes.stage, v.updateLeadsStage, updateLeadsStageController);
leadsRouter.post(leadsRoutes.stageRestore, v.restoreLeadStages, restoreLeadStagesController);
leadsRouter.get(leadsRoutes.byId, v.getLead, getLeadController);
leadsRouter.patch(leadsRoutes.byId, v.updateLead, updateLeadController);
leadsRouter.delete(leadsRoutes.byId, v.deleteLead, deleteLeadController);
leadsRouter.patch(leadsRoutes.stageById, v.updateLeadStage, updateLeadStageController);
leadsRouter.get(
  dashboardRoutes.leadsWithoutNextAction,
  v.listLeadsWithoutNextAction,
  listLeadsWithoutNextActionController
);
