import { dashboardRoutes, nextActionsRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  completeNextActionController,
  createNextActionController,
  listLeadNextActionsController,
  listNextActionsController,
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
nextActionsRouter.patch(nextActionsRoutes.byId, v.updateNextAction, updateNextActionController);
nextActionsRouter.post(
  nextActionsRoutes.complete,
  v.completeNextAction,
  completeNextActionController
);
