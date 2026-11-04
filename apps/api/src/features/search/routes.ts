import { searchRoutes } from "@vetra/routes";
import { Router } from "express";

import { searchRecordsController } from "./controllers";
import v from "./validators";

export const searchRouter: Router = Router();

searchRouter.get(searchRoutes.base, v.searchRecords, searchRecordsController);
