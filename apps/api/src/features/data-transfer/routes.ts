import { dataRoutes } from "@vetra/routes";
import { Router } from "express";

import { exportDataController } from "./controllers";
import v from "./validators";

export const dataTransferRouter: Router = Router();

dataTransferRouter.get(dataRoutes.export, v.exportData, exportDataController);
