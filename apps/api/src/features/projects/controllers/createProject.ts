import {
  type CreateCustomerProjectResponse,
  createCustomerProjectResponseSchema,
} from "@vetra/contracts";
import { projectServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromProjectInput, toCustomerProject } from "../helpers/projectResponses";
import type v from "../validators";

export async function createProjectController(
  req: ValidatedRequest<typeof v.createProject>,
  res: Response<CreateCustomerProjectResponse>
) {
  const project = await projectServices.createProject(req.params.id, fromProjectInput(req.body));
  res.status(201).json(createCustomerProjectResponseSchema.parse(toCustomerProject(project)));
}
