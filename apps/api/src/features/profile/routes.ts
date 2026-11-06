import { PROFILE_PHOTO_MAX_BYTES } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { Router } from "express";

import { rawFileBody } from "@/shared/middlewares/rawFileBody";

import {
  completeOnboardingController,
  getProfileController,
  getProfilePhotoController,
  removeProfilePhotoController,
  saveProfilePhotoController,
  updateProfileController,
} from "./controllers";
import v from "./validators";

export const profileRouter: Router = Router();

profileRouter.get(profileRoutes.base, v.getProfile, getProfileController);
profileRouter.patch(profileRoutes.base, v.updateProfile, updateProfileController);
profileRouter.get(profileRoutes.photo, v.getPhoto, getProfilePhotoController);
profileRouter.put(
  profileRoutes.photo,
  rawFileBody(PROFILE_PHOTO_MAX_BYTES),
  v.savePhoto,
  saveProfilePhotoController
);
profileRouter.delete(profileRoutes.photo, v.removePhoto, removeProfilePhotoController);
profileRouter.post(profileRoutes.onboarding, v.completeOnboarding, completeOnboardingController);
