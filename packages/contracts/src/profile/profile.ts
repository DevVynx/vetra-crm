import { z } from "zod";

export const PROFILE_NAME_MAX_LENGTH = 50;

export const profileNameSchema = z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH);

export const profileSchema = z.object({ name: profileNameSchema });
export type Profile = z.infer<typeof profileSchema>;

export const getProfileResponseSchema = profileSchema;
export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;

export const updateProfileRequestSchema = z.object({ name: profileNameSchema });
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const updateProfileResponseSchema = profileSchema;
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
