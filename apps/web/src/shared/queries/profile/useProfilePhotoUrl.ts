import { envConfig } from "@vetra/env/client-vite";
import { profileRoutes } from "@vetra/routes";

import { useProfile } from "@/shared/queries/profile/useProfile";

const { VITE_API_URL } = envConfig.get();

// The address of the user's photo, or undefined for the initials. The version in it changes with
// the photo, so a new one is never shown from the browser's cache.
export function useProfilePhotoUrl(): string | undefined {
  const { data: profile } = useProfile();
  if (profile?.photoVersion == null) return undefined;

  return `${VITE_API_URL}${profileRoutes.photo}?v=${profile.photoVersion}`;
}
