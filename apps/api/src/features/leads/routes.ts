import { dashboardRoutes, leadsRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  createLeadController,
  deleteLeadController,
  getLeadController,
  getLeadFilterOptionsController,
  listLeadIdsController,
  listLeadsController,
  listLeadsWithoutNextActionController,
  lookupLeadsController,
  restoreLeadStagesController,
  updateLeadController,
  updateLeadDoNotContactController,
  updateLeadsStageController,
  upsertLeadBySlugController,
} from "./controllers";
import v from "./validators";

export const leadsRouter: Router = Router();

leadsRouter.get(leadsRoutes.base, v.listLeads, listLeadsController);
leadsRouter.post(leadsRoutes.base, v.createLead, createLeadController);
// Fixed paths go before /leads/:id, otherwise "filter-options", "ids" and "stage" would be read as ids.
leadsRouter.get(leadsRoutes.filterOptions, v.getLeadFilterOptions, getLeadFilterOptionsController);
leadsRouter.get(leadsRoutes.ids, v.listLeadIds, listLeadIdsController);
leadsRouter.get(leadsRoutes.lookup, v.lookupLeads, lookupLeadsController);
leadsRouter.put(leadsRoutes.bySlug, v.upsertLeadBySlug, upsertLeadBySlugController);
leadsRouter.patch(leadsRoutes.stage, v.updateLeadsStage, updateLeadsStageController);
leadsRouter.post(leadsRoutes.stageRestore, v.restoreLeadStages, restoreLeadStagesController);
leadsRouter.get(leadsRoutes.byId, v.getLead, getLeadController);
leadsRouter.patch(leadsRoutes.byId, v.updateLead, updateLeadController);
leadsRouter.patch(
  leadsRoutes.doNotContact,
  v.updateLeadDoNotContact,
  updateLeadDoNotContactController
);
leadsRouter.delete(leadsRoutes.byId, v.deleteLead, deleteLeadController);
leadsRouter.get(
  dashboardRoutes.leadsWithoutNextAction,
  v.listLeadsWithoutNextAction,
  listLeadsWithoutNextActionController
);
