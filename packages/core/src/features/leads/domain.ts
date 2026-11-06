import { v7 as uuidv7 } from "uuid";

import type { Filter } from "../../shared/filters";
import { canonicalPhoneOf } from "../../shared/phone";
import { nextActionDomain, type NextActionInput } from "../next-actions/domain";
import type { Stage } from "../stages/domain";
import { LeadIsCustomerError, LeadMustCloseWithDealError } from "./errors";

export type Lead = {
  id: string;
  businessName: string;
  contactName: string | null;
  niche: string;
  city: string;
  phone: string;
  phoneKey: string;
  email: string | null;
  demoUrl: string | null;
  slug: string | null;
  doNotContact: boolean;
  stageId: string;
  stoppedAtStageId: string | null;
  stageChangedAt: Date;
  prospectedAt: Date;
  lastContactAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadContact = Pick<
  Lead,
  "businessName" | "contactName" | "niche" | "city" | "phone" | "email"
>;

// The photo comes from the conversation with the same number, so it isn't part of the lead itself.
export type LeadWithPhoto = Lead & { photoUrl: string | null };

// What can be typed for a lead. Customers only have the contact part: their screens have no demo.
export type LeadFields = LeadContact & Pick<Lead, "demoUrl">;

// The part of a lead a stage change touches, kept so the change can be undone exactly.
export type LeadStageState = Pick<Lead, "id" | "stageId" | "stoppedAtStageId" | "stageChangedAt">;

const isLive = (stage: Stage) => stage.role === "entry" || stage.role === "middle";

// What the prospecting pipeline sends for a lead. The next action is only used when the lead is created.
export type PipelineLeadInput = LeadFields & {
  prospectedAt: Date | null;
  doNotContact: boolean;
  nextAction: (Omit<NextActionInput, "dueAt"> & { dueAt: Date | null }) | null;
};

// The only fields the pipeline may change on a lead that exists.
export type PipelineLeadPatch = Partial<Pick<Lead, "demoUrl" | "contactName" | "email">> & {
  doNotContact?: true;
};

// New leads start in the entry stage, prospected now.
function create(fields: LeadFields, entryStage: Stage, now: Date): Lead {
  return {
    ...fields,
    slug: null,
    doNotContact: false,
    id: uuidv7(),
    phoneKey: canonicalPhoneOf(fields.phone),
    stageId: entryStage.id,
    stoppedAtStageId: null,
    stageChangedAt: now,
    prospectedAt: now,
    lastContactAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

// The lead and, if it came with one, its first action are made together, so there is never a lead
// that was meant to have the action and does not.
function createFromPipeline(
  slug: string,
  input: PipelineLeadInput,
  entryStage: Stage,
  now: Date
): { lead: Lead; nextAction: ReturnType<typeof nextActionDomain.create> | null } {
  const { prospectedAt, doNotContact, nextAction, ...fields } = input;
  const base = create(fields, entryStage, now);
  const lead: Lead = { ...base, slug, doNotContact, prospectedAt: prospectedAt ?? now };

  return {
    lead,
    nextAction: nextAction
      ? nextActionDomain.create(lead.id, { ...nextAction, dueAt: nextAction.dueAt ?? now })
      : null,
  };
}

// The pipeline owns the demo link, so a new one replaces the old. Everything else it only fills when
// empty, and it can only turn "do not contact" on: the user is the one who turns it off.
function pipelinePatchOf(lead: Lead, input: PipelineLeadInput): PipelineLeadPatch | null {
  const patch: PipelineLeadPatch = {};

  if (input.demoUrl !== null && input.demoUrl !== lead.demoUrl) patch.demoUrl = input.demoUrl;
  if (lead.contactName === null && input.contactName !== null)
    patch.contactName = input.contactName;
  if (lead.email === null && input.email !== null) patch.email = input.email;
  if (input.doNotContact && !lead.doNotContact) patch.doNotContact = true;

  return Object.keys(patch).length > 0 ? patch : null;
}

// A customer created directly, without going through the funnel, starts already closed.
function createClosed(contact: LeadContact, closingStage: Stage, now: Date): Lead {
  return create({ ...contact, demoUrl: null }, closingStage, now);
}

// Closing a deal is the only way into the closing stage.
function close(lead: Lead, current: Stage, closingStage: Stage, now: Date): LeadStageState {
  ensureIsNotCustomer(current);
  return { id: lead.id, stageId: closingStage.id, stoppedAtStageId: null, stageChangedAt: now };
}

function ensureIsNotCustomer(current: Stage): void {
  if (current.role === "closing") throw new LeadIsCustomerError();
}

// Archiving remembers the live stage the lead stopped at, so it can be reactivated there.
function moveToStage(lead: Lead, current: Stage, target: Stage, now: Date): LeadStageState {
  ensureIsNotCustomer(current);
  if (target.role === "closing") throw new LeadMustCloseWithDealError();

  const stoppedAtStageId =
    target.role === "archive" ? (isLive(current) ? current.id : lead.stoppedAtStageId) : null;

  return { id: lead.id, stageId: target.id, stoppedAtStageId, stageChangedAt: now };
}

function stageStateOf(lead: Lead): LeadStageState {
  return {
    id: lead.id,
    stageId: lead.stageId,
    stoppedAtStageId: lead.stoppedAtStageId,
    stageChangedAt: lead.stageChangedAt,
  };
}

// Lists show live leads only; archived ones appear when the stage filter asks for an archive stage.
function visibleStageIdsFor(stages: Stage[], filters: Filter[]): string[] {
  const requested = new Set(
    filters
      .filter(
        ({ field, operator }) =>
          field === "stage" && (operator === "is" || operator === "is_any_of")
      )
      .flatMap(({ values }) => values.map(String))
  );
  return stages
    .filter((stage) => isLive(stage) || (stage.role === "archive" && requested.has(stage.id)))
    .map((stage) => stage.id);
}

export const leadDomain = {
  close,
  create,
  createClosed,
  createFromPipeline,
  ensureIsNotCustomer,
  moveToStage,
  pipelinePatchOf,
  stageStateOf,
  visibleStageIdsFor,
};
