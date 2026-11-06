import { type PreviewImportResponse, previewImportResponseSchema } from "@vetra/contracts";
import { dataTransferServices } from "@vetra/core";
import type { Response } from "express";

import { BadRequestError } from "@/shared/http/errors";
import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function previewImportController(
  req: ValidatedRequest<typeof v.previewImport>,
  res: Response<PreviewImportResponse>
) {
  const content: unknown = req.body;
  if (!Buffer.isBuffer(content) || content.length === 0) {
    throw new BadRequestError("The request has no file.");
  }

  const report = await dataTransferServices.previewImport(content);
  res.json(previewImportResponseSchema.parse(report));
}
