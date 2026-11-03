import { profileRoutes } from "@vetra/routes";
import { Router } from "express";

import { getProfileController, updateProfileController } from "./controllers";
import v from "./validators";

export const profileRouter: Router = Router();

profileRouter.get(profileRoutes.base, v.getProfile, getProfileController);
profileRouter.patch(profileRoutes.base, v.updateProfile, updateProfileController);
