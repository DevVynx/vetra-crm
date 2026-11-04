import { v7 as uuidv7 } from "uuid";

import type { Filter } from "../../shared/filters";
import type { Stage } from "../stages/domain";
import { LeadIsCustomerError, LeadMustCloseWithDealError } from "./errors";

export type Lead = {
  id: string;
  businessName: string;
  contactName: string | null;
  niche: string;
  city: string;
  phone: string;
  email: string | null;
  demoUrl: string | null;
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

// What can be typed for a lead. Customers only have the contact part: their screens have no demo.
export type LeadFields = LeadContact & Pick<Lead, "demoUrl">;

// The part of a lead a stage change touches, kept so the change can be undone exactly.
export type LeadStageState = Pick<Lead, "id" | "stageId" | "stoppedAtStageId" | "stageChangedAt">;

const isLive = (stage: Stage) => stage.role === "entry" || stage.role === "middle";

// New leads start in the entry stage, prospected now.
function create(fields: LeadFields, entryStage: Stage, now: Date): Lead {
  return {
    ...fields,
    id: uuidv7(),
    stageId: entryStage.id,
    stoppedAtStageId: null,
    stageChangedAt: now,
    prospectedAt: now,
    lastContactAt: null,
    createdAt: now,
    updatedAt: now,
  };
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
  ensureIsNotCustomer,
  moveToStage,
  stageStateOf,
  visibleStageIdsFor,
};
