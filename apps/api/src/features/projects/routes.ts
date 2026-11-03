import { projectsRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  createProjectController,
  deleteProjectController,
  listProjectsController,
  updateProjectController,
} from "./controllers";
import v from "./validators";

export const projectsRouter: Router = Router();

projectsRouter.get(projectsRoutes.byCustomer, v.listProjects, listProjectsController);
projectsRouter.post(projectsRoutes.byCustomer, v.createProject, createProjectController);
projectsRouter.patch(projectsRoutes.byId, v.updateProject, updateProjectController);
projectsRouter.delete(projectsRoutes.byId, v.deleteProject, deleteProjectController);
