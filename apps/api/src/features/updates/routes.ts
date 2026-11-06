import { updatesRoutes } from "@vetra/routes";
import { Router } from "express";

import { getUpdatesController } from "./controllers";
import v from "./validators";

export const updatesRouter: Router = Router();

updatesRouter.get(updatesRoutes.base, v.getUpdates, getUpdatesController);
