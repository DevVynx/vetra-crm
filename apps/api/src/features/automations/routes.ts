import { automationsRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  getAutomationLeadsController,
  getAutomationSettingsController,
  setAutomationLeadsController,
  updateAutomationSettingsController,
} from "./controllers";
import v from "./validators";

export const automationsRouter: Router = Router();

automationsRouter.get(
  automationsRoutes.base,
  v.getAutomationSettings,
  getAutomationSettingsController
);
automationsRouter.patch(
  automationsRoutes.base,
  v.updateAutomationSettings,
  updateAutomationSettingsController
);
automationsRouter.get(automationsRoutes.leads, v.getAutomationLeads, getAutomationLeadsController);
automationsRouter.patch(
  automationsRoutes.leads,
  v.setAutomationLeads,
  setAutomationLeadsController
);
