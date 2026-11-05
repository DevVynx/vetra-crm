import { z } from "zod";

export const PROFILE_NAME_MAX_LENGTH = 50;

export const profileNameSchema = z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH);

const isSupportedTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const timeZoneSchema = z
  .string()
  .min(1)
  .refine(isSupportedTimeZone, { message: "invalidTimeZone" });

export const profileSchema = z.object({ name: profileNameSchema, timeZone: timeZoneSchema });
export type Profile = z.infer<typeof profileSchema>;

export const PROFILE_PHOTO_MAX_BYTES = 512 * 1024;
export const PROFILE_PHOTO_SIZE_PX = 256;

// The version is when the photo file was last changed (null without one). It goes in the image
// address, so a new photo is not shown from the browser's cache.
const profileWithPhotoSchema = profileSchema.extend({ photoVersion: z.number().int().nullable() });

export const getProfileResponseSchema = profileWithPhotoSchema;
export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;

export const updateProfileRequestSchema = profileSchema.partial();
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const updateProfileResponseSchema = profileWithPhotoSchema;
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
