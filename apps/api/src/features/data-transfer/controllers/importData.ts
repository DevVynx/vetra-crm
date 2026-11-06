import { type ImportDataResponse, importDataResponseSchema } from "@vetra/contracts";
import { dataTransferServices } from "@vetra/core";
import type { Response } from "express";

import { BadRequestError } from "@/shared/http/errors";
import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function importDataController(
  req: ValidatedRequest<typeof v.importData>,
  res: Response<ImportDataResponse>
) {
  const content: unknown = req.body;
  if (!Buffer.isBuffer(content) || content.length === 0) {
    throw new BadRequestError("The request has no file.");
  }

  const report = await dataTransferServices.importData(content);
  res.json(importDataResponseSchema.parse(report));
}
