import {
  type UpdateCustomerProjectResponse,
  updateCustomerProjectResponseSchema,
} from "@vetra/contracts";
import { projectServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromProjectInput, toCustomerProject } from "../helpers/projectResponses";
import type v from "../validators";

export async function updateProjectController(
  req: ValidatedRequest<typeof v.updateProject>,
  res: Response<UpdateCustomerProjectResponse>
) {
  const project = await projectServices.updateProject(
    req.params.id,
    req.params.projectId,
    fromProjectInput(req.body)
  );
  res.json(updateCustomerProjectResponseSchema.parse(toCustomerProject(project)));
}
