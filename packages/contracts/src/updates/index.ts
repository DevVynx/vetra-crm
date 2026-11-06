import { z } from "zod";

export const getUpdatesQuerySchema = z.object({
  // "Verificar agora": reads the list of releases again instead of using the one kept.
  refresh: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});
export type GetUpdatesQuery = z.infer<typeof getUpdatesQuerySchema>;

export const updateInfoSchema = z.object({
  currentVersion: z.string(),
  // False for a build that is not an image (development): there is nothing to compare.
  canCheck: z.boolean(),
  checkFailed: z.boolean(),
  hasUpdate: z.boolean(),
  latestVersion: z.string().nullable(),
  releaseUrl: z.string().nullable(),
  publishedAt: z.string().nullable(),
});
export type UpdateInfo = z.infer<typeof updateInfoSchema>;
