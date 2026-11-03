import type { DeleteCustomerProjectResponse } from "@vetra/contracts";
import { projectServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteProjectController(
  req: ValidatedRequest<typeof v.deleteProject>,
  res: Response<DeleteCustomerProjectResponse>
) {
  await projectServices.deleteProject(req.params.id, req.params.projectId);
  res.status(204).end();
}
