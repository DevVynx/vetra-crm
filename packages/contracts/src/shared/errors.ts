import { z } from "zod";

export const validationIssueSchema = z.object({
  path: z.string(),
  code: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
});
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  issues: z.array(validationIssueSchema).optional(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
