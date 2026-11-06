import { isUniqueViolation } from "@vetra/database";

import { canonicalPhoneOf } from "../../../shared/phone";
import { newLeadAutoSendOf } from "../../automations/domain";
import { getAutomationSettings } from "../../automations/services/getAutomationSettings";
import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { type Lead, leadDomain, type PipelineLeadInput } from "../domain";
import { LeadNotFoundError } from "../errors";
import { type LeadLookupRow, leadRepositories } from "../repositories";

export type PipelineUpsertResult = {
  created: boolean;
  // Set when the slug is new but its phone already belongs to another lead: nothing was created
  // and `lead` is the one that owns the number.
  conflict: "phone" | null;
  lead: LeadLookupRow;
};

async function lookupRowOf(id: string): Promise<LeadLookupRow> {
  const row = await leadRepositories.findLeadLookupRow(id);
  if (!row) throw new LeadNotFoundError();

  return row;
}

async function updateExisting(
  existing: Lead,
  input: PipelineLeadInput
): Promise<PipelineUpsertResult> {
  const patch = leadDomain.pipelinePatchOf(existing, input);
  if (patch) await leadRepositories.updateLeadFromPipeline(existing.id, patch);

  return { created: false, conflict: null, lead: await lookupRowOf(existing.id) };
}

async function phoneConflict(ownerId: string): Promise<PipelineUpsertResult> {
  return { created: false, conflict: "phone", lead: await lookupRowOf(ownerId) };
}

// Idempotent: sending the same lead again never makes a second one, and only creates its first
// action the time it creates the lead. A phone is never changed here.
export async function upsertLeadBySlug(
  slug: string,
  input: PipelineLeadInput
): Promise<PipelineUpsertResult> {
  const existing = await leadRepositories.findLeadBySlug(slug);
  if (existing) return updateExisting(existing, input);

  const phoneKey = canonicalPhoneOf(input.phone);
  const phoneOwner = await leadRepositories.findLeadIdByPhoneKey(phoneKey);
  if (phoneOwner) return phoneConflict(phoneOwner);

  const [stages, settings] = await Promise.all([
    stageRepositories.findStages(),
    getAutomationSettings(),
  ]);
  const { lead, nextAction } = leadDomain.createFromPipeline(
    slug,
    input,
    stageDomain.entryOf(stages),
    new Date(),
    newLeadAutoSendOf(settings)
  );

  try {
    await leadRepositories.insertLeadWithNextAction(lead, nextAction);
  } catch (error) {
    // The checks above can lose a race against another request, and then the unique indexes answer.
    if (isUniqueViolation(error, "leads_slug_idx")) {
      const winner = await leadRepositories.findLeadBySlug(slug);
      if (winner) return updateExisting(winner, input);
    }
    if (isUniqueViolation(error, "leads_phone_key_idx")) {
      const owner = await leadRepositories.findLeadIdByPhoneKey(phoneKey);
      if (owner) return phoneConflict(owner);
    }
    throw error;
  }

  return { created: true, conflict: null, lead: await lookupRowOf(lead.id) };
}
