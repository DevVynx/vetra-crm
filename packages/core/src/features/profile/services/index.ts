import { ensureProfile } from "./ensureProfile";
import { getProfile } from "./getProfile";
import { getProfileWithPhoto } from "./getProfileWithPhoto";
import { readProfilePhoto } from "./readProfilePhoto";
import { removeProfilePhoto } from "./removeProfilePhoto";
import { saveProfilePhoto } from "./saveProfilePhoto";
import { updateProfile } from "./updateProfile";

export const profileServices = {
  ensureProfile,
  getProfile,
  getProfileWithPhoto,
  readProfilePhoto,
  removeProfilePhoto,
  saveProfilePhoto,
  updateProfile,
};
