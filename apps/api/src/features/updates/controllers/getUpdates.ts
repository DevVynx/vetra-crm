import { type UpdateInfo, updateInfoSchema } from "@vetra/contracts";
import { updateServices } from "@vetra/core";
import { envConfig } from "@vetra/env/server";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function getUpdatesController(
  req: ValidatedRequest<typeof v.getUpdates>,
  res: Response<UpdateInfo>
) {
  const info = await updateServices.getUpdateInfo(envConfig.get().VETRA_VERSION, req.query.refresh);
  res.json(updateInfoSchema.parse(info));
}
