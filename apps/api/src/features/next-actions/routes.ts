import { dashboardRoutes, nextActionsRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  completeNextActionController,
  createNextActionController,
  deleteNextActionController,
  listLeadNextActionsController,
  listNextActionsController,
  reopenNextActionController,
  restoreNextActionController,
  updateNextActionController,
} from "./controllers";
import v from "./validators";

export const nextActionsRouter: Router = Router();

nextActionsRouter.get(dashboardRoutes.nextActions, v.listNextActions, listNextActionsController);
nextActionsRouter.get(
  nextActionsRoutes.byLead,
  v.listLeadNextActions,
  listLeadNextActionsController
);
nextActionsRouter.post(nextActionsRoutes.base, v.createNextAction, createNextActionController);
// /next-actions/restore goes before the routes with an id, otherwise "restore" would be read as one.
nextActionsRouter.post(nextActionsRoutes.restore, v.restoreNextAction, restoreNextActionController);
nextActionsRouter.patch(nextActionsRoutes.byId, v.updateNextAction, updateNextActionController);
nextActionsRouter.delete(nextActionsRoutes.byId, v.deleteNextAction, deleteNextActionController);
nextActionsRouter.post(
  nextActionsRoutes.complete,
  v.completeNextAction,
  completeNextActionController
);
nextActionsRouter.post(nextActionsRoutes.reopen, v.reopenNextAction, reopenNextActionController);
