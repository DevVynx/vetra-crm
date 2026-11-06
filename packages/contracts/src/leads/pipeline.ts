import { z } from "zod";

import { stageRoleSchema } from "../stages";
import { demoUrlSchema } from "./common";
import { leadContactFieldsSchema } from "./contact";

// The import in packages/core reads the same rule (core does not import contracts): keep them equal.
export const leadSlugSchema = z
  .string()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const leadSlugParamsSchema = z.object({ slug: leadSlugSchema });

export const systemResponseSchema = z.object({
  name: z.literal("vetra"),
  apiVersion: z.literal(1),
});
export type SystemResponse = z.infer<typeof systemResponseSchema>;

export const pipelineLeadSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  businessName: z.string(),
  city: z.string(),
  phone: z.string(),
  doNotContact: z.boolean(),
  stage: z.object({ name: z.string(), role: stageRoleSchema }),
});
export type PipelineLead = z.infer<typeof pipelineLeadSchema>;

const MAX_LOOKUP_VALUES = 20;
const MAX_LOOKUP_VALUE_LENGTH = 120;

// A value repeated in the address (?phone=1&phone=2) arrives as a list, a single one as a text.
const valuesOf = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]))
  .pipe(z.array(z.string().trim().min(1).max(MAX_LOOKUP_VALUE_LENGTH)).max(MAX_LOOKUP_VALUES));

export const lookupLeadsQuerySchema = z.object({
  slug: valuesOf,
  phone: valuesOf,
  name: z.string().trim().min(1).max(MAX_LOOKUP_VALUE_LENGTH).optional(),
  city: z.string().trim().min(1).max(MAX_LOOKUP_VALUE_LENGTH).optional(),
});
export type LookupLeadsQuery = z.infer<typeof lookupLeadsQuerySchema>;

export const lookupLeadsResponseSchema = z.object({
  leads: z.array(
    pipelineLeadSchema.extend({
      matchedBy: z.array(z.enum(["slug", "phone", "name_and_city", "name"])),
    })
  ),
});
export type LookupLeadsResponse = z.infer<typeof lookupLeadsResponseSchema>;

const pipelineInstantSchema = z.iso.datetime({ offset: true });

const pipelineNextActionSchema = z
  .object({
    type: z.enum(["first_approach", "follow_up"]),
    followUpStep: z.number().int().positive().nullable().default(null),
    description: z.string().trim().min(1).max(200),
    body: z
      .string()
      .trim()
      .max(4000)
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .default(null),
    dueAt: pipelineInstantSchema.nullable().default(null),
  })
  .refine((action) => action.type !== "follow_up" || action.followUpStep !== null, {
    message: "followUpStepRequired",
    path: ["followUpStep"],
  });

export const upsertLeadBySlugRequestSchema = z.object({
  businessName: leadContactFieldsSchema.shape.businessName,
  niche: leadContactFieldsSchema.shape.niche,
  city: leadContactFieldsSchema.shape.city,
  phone: leadContactFieldsSchema.shape.phone,
  contactName: leadContactFieldsSchema.shape.contactName.default(null),
  email: leadContactFieldsSchema.shape.email.default(null),
  demoUrl: demoUrlSchema.nullable().default(null),
  prospectedAt: pipelineInstantSchema.nullable().default(null),
  doNotContact: z.boolean().default(false),
  nextAction: pipelineNextActionSchema.nullable().default(null),
});
export type UpsertLeadBySlugRequest = z.infer<typeof upsertLeadBySlugRequestSchema>;

export const upsertLeadBySlugResponseSchema = z.object({
  created: z.boolean(),
  conflict: z.literal("phone").nullable(),
  lead: pipelineLeadSchema,
});
export type UpsertLeadBySlugResponse = z.infer<typeof upsertLeadBySlugResponseSchema>;

export const updateLeadDoNotContactRequestSchema = z.object({ doNotContact: z.boolean() });
export type UpdateLeadDoNotContactRequest = z.infer<typeof updateLeadDoNotContactRequestSchema>;

const MAX_LEAD_MESSAGES = 500;
const DEFAULT_LEAD_MESSAGES = 200;

export const leadMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LEAD_MESSAGES).default(DEFAULT_LEAD_MESSAGES),
});
export type LeadMessagesQuery = z.infer<typeof leadMessagesQuerySchema>;

// What the pipeline may read of a lead's conversation, and nothing else: no ids, no media, no other
// conversation. A deleted message has no text.
export const leadMessagesResponseSchema = z.object({
  hasConversation: z.boolean(),
  hasMore: z.boolean(),
  messages: z.array(
    z.object({
      direction: z.enum(["inbound", "outbound"]),
      type: z.enum(["text", "audio", "image", "video", "document", "sticker", "other"]),
      text: z.string().nullable(),
      isDeleted: z.boolean(),
      sentAt: z.iso.datetime(),
    })
  ),
});
export type LeadMessagesResponse = z.infer<typeof leadMessagesResponseSchema>;
