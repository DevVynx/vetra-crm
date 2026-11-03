import {
  type ListCustomerProjectsResponse,
  listCustomerProjectsResponseSchema,
} from "@vetra/contracts";
import { projectServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toCustomerProject } from "../helpers/projectResponses";
import type v from "../validators";

export async function listProjectsController(
  req: ValidatedRequest<typeof v.listProjects>,
  res: Response<ListCustomerProjectsResponse>
) {
  const projects = await projectServices.listProjects(req.params.id);
  res.json(listCustomerProjectsResponseSchema.parse({ projects: projects.map(toCustomerProject) }));
}
