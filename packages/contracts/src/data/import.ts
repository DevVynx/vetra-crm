import { z } from "zod";

export const DATA_IMPORT_MAX_BYTES = 10 * 1024 * 1024;

// How many of each the file holds: new ones, ones left out because they belong to a lead that
// already exists (or repeats), and ones with an error.
const countsSchema = z.object({
  new: z.number().int(),
  skipped: z.number().int(),
  invalid: z.number().int(),
});

export type ImportCounts = z.infer<typeof countsSchema>;

// The codes are stable and in English; the web writes them in Portuguese.
export const importErrorSchema = z.object({
  file: z.string(),
  line: z.number().int(),
  column: z.string().nullable(),
  code: z.string(),
});
export type ImportError = z.infer<typeof importErrorSchema>;

export const importSkippedLeadSchema = z.object({
  line: z.number().int(),
  name: z.string(),
  reason: z.enum(["exists", "repeated"]),
});
export type ImportSkippedLead = z.infer<typeof importSkippedLeadSchema>;

export const importReportSchema = z.object({
  leads: countsSchema,
  projects: countsSchema,
  installments: countsSchema,
  expenses: countsSchema,
  notes: countsSchema,
  activities: countsSchema,
  errors: z.array(importErrorSchema),
  hiddenErrors: z.number().int(),
  skippedLeads: z.array(importSkippedLeadSchema),
  hiddenSkippedLeads: z.number().int(),
});
export type ImportReport = z.infer<typeof importReportSchema>;

export const previewImportResponseSchema = importReportSchema;
export type PreviewImportResponse = ImportReport;

export const importDataResponseSchema = importReportSchema;
export type ImportDataResponse = ImportReport;
