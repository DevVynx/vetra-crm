import { isUniqueViolation } from "@vetra/database";

import { canonicalPhoneOf } from "../../../shared/phone";
import { newLeadAutoSendOf } from "../../automations/domain";
import { getAutomationSettings } from "../../automations/services/getAutomationSettings";
import type { QueuedFollowUpInput } from "../../next-actions/domain";
import { nextActionRepositories } from "../../next-actions/repositories";
import { stageDomain } from "../../stages/domain";
import { stageRepositories } from "../../stages/repositories";
import { whatsappRepositories } from "../../whatsapp/repositories";
import { type Lead, leadDomain, type PipelineLeadInput } from "../domain";
import { LeadNotFoundError } from "../errors";
import { type LeadLookupRow, leadRepositories } from "../repositories";
import { followUpStatesOf, type LeadFollowUpState } from "./lookupLeads";

// Why the follow-ups of a call were not taken. Never an error: the lead is upserted all the same.
export type FollowUpsIgnoredReason =
  | "already_has"
  | "replied"
  | "not_in_funnel"
  | "do_not_contact"
  | "needs_approach_sent_at"
  | "follow_ups_off";

export type FollowUpsResult = { queued: number; ignored: FollowUpsIgnoredReason | null };

const noFollowUps: FollowUpsResult = { queued: 0, ignored: null };

// The pipeline gives the texts in order; Vetra keeps the first ones, as many as its setting says, and numbers them.
const followUpsToKeep = (texts: string[], limit: number): QueuedFollowUpInput[] =>
  texts.slice(0, limit).map((body, index) => ({ step: index + 1, body }));

export type PipelineUpsertResult = {
  followUps: FollowUpsResult;
  created: boolean;
  // Set when the slug is new but its phone already belongs to another lead: nothing was created
  // and `lead` is the one that owns the number.
  conflict: "phone" | null;
  lead: LeadLookupRow & { followUps: LeadFollowUpState[] };
};

async function lookupRowOf(id: string): Promise<LeadLookupRow> {
  const row = await leadRepositories.findLeadLookupRow(id);
  if (!row) throw new LeadNotFoundError();

  return row;
}

async function withFollowUps(row: LeadLookupRow): Promise<PipelineUpsertResult["lead"]> {
  const followUpsOf = await followUpStatesOf([row.id]);

  return { ...row, followUps: followUpsOf(row.id) };
}

// Follow-ups for a lead that exists (how an older lead is given its plan): only once, only if it is still in the
// funnel, can be contacted and did not answer, and only when the moment of its opening message is told.
async function followUpsOfExisting(
  lead: Lead,
  doNotContact: boolean,
  input: PipelineLeadInput
): Promise<FollowUpsResult> {
  if (input.followUps.length === 0) return noFollowUps;

  const { followUpLimit, followUpWaitDays } = await getAutomationSettings();
  const items = followUpsToKeep(input.followUps, followUpLimit);

  const ignored = (reason: FollowUpsIgnoredReason): FollowUpsResult => ({
    queued: 0,
    ignored: reason,
  });

  if (items.length === 0) return ignored("follow_ups_off");
  if (await nextActionRepositories.hasQueuedFollowUps(lead.id)) return ignored("already_has");

  const stages = await stageRepositories.findStages();
  const stage = stages.find((item) => item.id === lead.stageId);
  if (!stage || (stage.role !== "entry" && stage.role !== "middle"))
    return ignored("not_in_funnel");
  if (doNotContact) return ignored("do_not_contact");
  if (!input.approachSentAt) return ignored("needs_approach_sent_at");
  if (await whatsappRepositories.hasInboundMessageSince(lead.phoneKey, input.approachSentAt)) {
    return ignored("replied");
  }

  try {
    await nextActionRepositories.queueFollowUps(lead.id, items, {
      anchorAt: input.approachSentAt,
      waitDays: followUpWaitDays,
    });
  } catch (error) {
    // Two calls at once: the other one won, and its texts are the ones kept.
    if (isUniqueViolation(error, "queued_follow_ups_lead_step_idx")) return ignored("already_has");
    throw error;
  }

  return { queued: items.length, ignored: null };
}

async function updateExisting(
  existing: Lead,
  input: PipelineLeadInput
): Promise<PipelineUpsertResult> {
  const patch = leadDomain.pipelinePatchOf(existing, input);
  if (patch) await leadRepositories.updateLeadFromPipeline(existing.id, patch);

  const { doNotContact } = await lookupRowOf(existing.id);
  const followUps = await followUpsOfExisting(existing, doNotContact, input);

  return {
    created: false,
    conflict: null,
    lead: await withFollowUps(await lookupRowOf(existing.id)),
    followUps,
  };
}

async function phoneConflict(ownerId: string): Promise<PipelineUpsertResult> {
  return {
    created: false,
    conflict: "phone",
    lead: await withFollowUps(await lookupRowOf(ownerId)),
    followUps: noFollowUps,
  };
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

  // The texts are kept with the lead, and with no opening in Vetra the first one starts counting from the
  // moment the opening message went, which the call tells.
  const items = followUpsToKeep(input.followUps, settings.followUpLimit);
  const wantsFollowUps = items.length > 0 && !lead.doNotContact;
  const schedule =
    !nextAction && input.approachSentAt
      ? { anchorAt: input.approachSentAt, waitDays: settings.followUpWaitDays }
      : null;

  try {
    await leadRepositories.insertLeadWithNextAction(
      lead,
      nextAction,
      wantsFollowUps
        ? (tx) => nextActionRepositories.queueFollowUpsIn(tx, lead.id, items, schedule)
        : undefined
    );
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

  const followUps: FollowUpsResult =
    input.followUps.length === 0
      ? noFollowUps
      : items.length === 0
        ? { queued: 0, ignored: "follow_ups_off" }
        : wantsFollowUps
          ? { queued: items.length, ignored: null }
          : { queued: 0, ignored: "do_not_contact" };

  return {
    created: true,
    conflict: null,
    lead: await withFollowUps(await lookupRowOf(lead.id)),
    followUps,
  };
}
