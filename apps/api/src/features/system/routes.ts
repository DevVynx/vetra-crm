import { systemRoutes } from "@vetra/routes";
import { Router } from "express";

import { getSystemController } from "./controllers";

export const systemRouter: Router = Router();

systemRouter.get(systemRoutes.base, getSystemController);
