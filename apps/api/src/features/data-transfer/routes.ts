import { DATA_IMPORT_MAX_BYTES } from "@vetra/contracts";
import { dataRoutes } from "@vetra/routes";
import { Router } from "express";

import { rawFileBody } from "@/shared/middlewares/rawFileBody";

import { exportDataController, importDataController, previewImportController } from "./controllers";
import v from "./validators";

export const dataTransferRouter: Router = Router();

dataTransferRouter.get(dataRoutes.export, v.exportData, exportDataController);
dataTransferRouter.post(
  dataRoutes.importPreview,
  v.previewImport,
  rawFileBody(DATA_IMPORT_MAX_BYTES),
  previewImportController
);
dataTransferRouter.post(
  dataRoutes.import,
  v.importData,
  rawFileBody(DATA_IMPORT_MAX_BYTES),
  importDataController
);
