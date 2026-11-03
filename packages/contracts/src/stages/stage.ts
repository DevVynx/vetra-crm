import { z } from "zod";

export const STAGE_NAME_MAX_LENGTH = 30;

export const stageRoleSchema = z.enum(["entry", "middle", "closing", "archive"]);
export type StageRole = z.infer<typeof stageRoleSchema>;

export const stageColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const stageNameSchema = z.string().trim().min(1).max(STAGE_NAME_MAX_LENGTH);

export const stageSchema = z.object({
  id: z.string(),
  name: stageNameSchema,
  color: stageColorSchema,
  role: stageRoleSchema,
  position: z.number().int().nonnegative(),
});
export type Stage = z.infer<typeof stageSchema>;

export const listStagesResponseSchema = z.object({ stages: z.array(stageSchema) });
export type ListStagesResponse = z.infer<typeof listStagesResponseSchema>;

export const createStageRequestSchema = z.object({
  name: stageNameSchema,
  color: stageColorSchema,
  role: stageRoleSchema.extract(["middle", "archive"]),
});
export type CreateStageRequest = z.infer<typeof createStageRequestSchema>;

export const createStageResponseSchema = stageSchema;
export type CreateStageResponse = z.infer<typeof createStageResponseSchema>;

export const updateStageRequestSchema = z.object({
  name: stageNameSchema,
  color: stageColorSchema,
});
export type UpdateStageRequest = z.infer<typeof updateStageRequestSchema>;

export const updateStageResponseSchema = stageSchema;
export type UpdateStageResponse = z.infer<typeof updateStageResponseSchema>;

export const reorderStagesRequestSchema = z.object({
  middleIds: z.array(z.string()),
  archiveIds: z.array(z.string()),
});
export type ReorderStagesRequest = z.infer<typeof reorderStagesRequestSchema>;

export const reorderStagesResponseSchema = listStagesResponseSchema;
export type ReorderStagesResponse = z.infer<typeof reorderStagesResponseSchema>;

export const deleteStageResponseSchema = z.void();
export type DeleteStageResponse = z.infer<typeof deleteStageResponseSchema>;

export const listStageLeadCountsResponseSchema = z.object({
  counts: z.record(z.string(), z.number().int().nonnegative()),
});
export type ListStageLeadCountsResponse = z.infer<typeof listStageLeadCountsResponseSchema>;

export const stageParamsSchema = z.object({ id: z.string().min(1) });
export type StageParams = z.infer<typeof stageParamsSchema>;
