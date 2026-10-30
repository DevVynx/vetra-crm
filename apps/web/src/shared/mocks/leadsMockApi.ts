import {
  type CloseLeadRequest,
  type CloseLeadResponse,
  type CreateLeadNoteRequest,
  type CreateLeadNoteResponse,
  type CreateLeadRequest,
  type CreateLeadResponse,
  type Filter,
  type FilterOptionsQuery,
  type FilterOptionsResponse,
  type GetLeadResponse,
  type LeadNote,
  type LeadSummary,
  type ListLeadNotesResponse,
  type ListLeadsQuery,
  type ListLeadsResponse,
  type ListNextActionsResponse,
  liveStageSchema,
  type UpdateLeadNoteRequest,
  type UpdateLeadNoteResponse,
  type UpdateLeadRequest,
  type UpdateLeadStageRequest,
  type UpdateLeadStageResponse,
} from "@vetra/contracts";

import { normalizeText } from "@/shared/utils/text";

import { distinctOptions, type FilterAccessors, matchesFilters } from "./filterEngine";
import { addMockLead, lastContactFor, leadContactFor, mockLeads, updateMockLead } from "./fixtures";
import { mockStore, openWonDeal, paginate, respond } from "./store";


const isLive = (lead: LeadSummary) => liveStageSchema.safeParse(lead.stage).success;

const nextActionOf = (leadId: string) =>
  mockStore.nextActions
    .filter((action) => action.lead.id === leadId)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];

const leadFilterAccessors: FilterAccessors<LeadSummary> = {
  stage: (lead) => lead.stage,
  niche: (lead) => lead.niche,
  city: (lead) => lead.city,
  next_action: (lead) => Boolean(nextActionOf(lead.id)),
  last_contact: (lead) => lastContactFor(lead),
  prospected_at: (lead) => lead.prospectedAt,
};

// Archived leads stay out of every list unless the user asks for them with Etapa "é".
const showsArchived = (filters: Filter[]) =>
  filters.some(
    ({ field, operator, values }) =>
      field === "stage" &&
      (operator === "is" || operator === "is_any_of") &&
      values.some((value) => value === "lost" || value === "no_response")
  );

const matchesSearch = (lead: LeadSummary, query: string) => {
  const search = normalizeText(query);
  return [lead.businessName, lead.contactName ?? "", lead.niche, lead.city].some((field) =>
    normalizeText(field).includes(search)
  );
};

const findLead = (id: string): LeadSummary => {
  const found = mockLeads.find((lead) => lead.id === id);
  if (!found) throw new Error(`Lead ${id} not found`);
  return found;
};

const isArchivedStage = (stage: LeadSummary["stage"]) => stage === "lost" || stage === "no_response";

const stoppedAtAfter = (lead: LeadSummary, stage: LeadSummary["stage"]) => {
  if (!isArchivedStage(stage)) return null;
  const live = liveStageSchema.safeParse(lead.stage);
  return live.success ? live.data : lead.stoppedAtStage;
};

const moveLead = (lead: LeadSummary, stage: UpdateLeadStageRequest["stage"]): LeadSummary => {
  const updated: LeadSummary = { ...lead, stage, stoppedAtStage: stoppedAtAfter(lead, stage) };
  mockLeads[mockLeads.indexOf(lead)] = updated;
  if (isArchivedStage(stage)) {
    mockStore.nextActions = mockStore.nextActions.filter((action) => action.lead.id !== lead.id);
  }
  return updated;
};

export const leadsMockApi = {
  listLeads({ q, filters, page, pageSize }: ListLeadsQuery): Promise<ListLeadsResponse> {
    const archivedVisible = showsArchived(filters);
    const items = mockLeads
      .filter(
        (lead) =>
          (isLive(lead) || (archivedVisible && isArchivedStage(lead.stage))) &&
          matchesFilters(lead, filters, leadFilterAccessors) &&
          matchesSearch(lead, q)
      )
      .map((lead) => {
        const action = nextActionOf(lead.id);
        return {
          ...lead,
          nextAction: action ? { description: action.description, dueAt: action.dueAt } : null,
          lastContactAt: lastContactFor(lead),
        };
      })
      .sort((a, b) => {
        if (a.nextAction && b.nextAction) return a.nextAction.dueAt.localeCompare(b.nextAction.dueAt);
        if (a.nextAction || b.nextAction) return a.nextAction ? -1 : 1;
        return b.prospectedAt.localeCompare(a.prospectedAt);
      });

    return respond(paginate(items, page, pageSize));
  },

  getLeadFilterOptions({ field }: FilterOptionsQuery): Promise<FilterOptionsResponse> {
    return respond({
      items: distinctOptions(mockLeads.filter(isLive).map((lead) => lead[field])),
    });
  },

  getLead(id: string): Promise<GetLeadResponse> {
    const lead = findLead(id);
    return respond({ ...lead, ...leadContactFor(lead) });
  },

  listLeadNextActions(leadId: string): Promise<ListNextActionsResponse> {
    findLead(leadId);
    return respond({
      nextActions: mockStore.nextActions
        .filter((action) => action.lead.id === leadId)
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    });
  },

  listLeadNotes(leadId: string): Promise<ListLeadNotesResponse> {
    findLead(leadId);
    return respond({
      notes: mockStore.notes
        .filter((note) => note.leadId === leadId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  },

  createLeadNote(leadId: string, { content }: CreateLeadNoteRequest): Promise<CreateLeadNoteResponse> {
    findLead(leadId);
    const note: LeadNote = {
      id: crypto.randomUUID(),
      leadId,
      content,
      createdAt: new Date().toISOString(),
    };
    mockStore.notes = [...mockStore.notes, note];
    return respond(note);
  },

  updateLeadNote(noteId: string, { content }: UpdateLeadNoteRequest): Promise<UpdateLeadNoteResponse> {
    const note = mockStore.notes.find((item) => item.id === noteId);
    if (!note) throw new Error(`Note ${noteId} not found`);
    const updated: LeadNote = { ...note, content };
    mockStore.notes = mockStore.notes.map((item) => (item.id === noteId ? updated : item));
    return respond(updated);
  },

  restoreLeadNote(note: LeadNote): Promise<void> {
    mockStore.notes = [...mockStore.notes, note];
    return respond(undefined);
  },

  deleteLeadNote(noteId: string): Promise<void> {
    mockStore.notes = mockStore.notes.filter((item) => item.id !== noteId);
    return respond(undefined);
  },

  updateLeadStage(id: string, { stage }: UpdateLeadStageRequest): Promise<UpdateLeadStageResponse> {
    return respond(moveLead(findLead(id), stage));
  },

  updateLeadsStage(ids: string[], { stage }: UpdateLeadStageRequest): Promise<LeadSummary[]> {
    const previous = ids.map((id) => findLead(id));
    previous.forEach((lead) => moveLead(lead, stage));
    return respond(previous);
  },

  restoreLeads(leads: LeadSummary[]): Promise<void> {
    leads.forEach((lead) => {
      mockLeads[mockLeads.findIndex((item) => item.id === lead.id)] = lead;
    });
    return respond(undefined);
  },

  closeLead(id: string, { closedValueInCents, firstInstallmentDueAt }: CloseLeadRequest): Promise<CloseLeadResponse> {
    const lead = findLead(id);
    openWonDeal(id, closedValueInCents, firstInstallmentDueAt);
    mockStore.nextActions = mockStore.nextActions.filter((action) => action.lead.id !== id);
    const closed: LeadSummary = { ...lead, stage: "won", stoppedAtStage: null };
    mockLeads[mockLeads.indexOf(lead)] = closed;
    return respond(closed);
  },

  createLead(request: CreateLeadRequest): Promise<CreateLeadResponse> {
    return respond(addMockLead(request, "prospected"));
  },

  updateLead(id: string, request: UpdateLeadRequest): Promise<void> {
    findLead(id);
    updateMockLead(id, request);
    return respond(undefined);
  },

  deleteLead(id: string): Promise<void> {
    const lead = findLead(id);
    mockLeads.splice(mockLeads.indexOf(lead), 1);
    mockStore.nextActions = mockStore.nextActions.filter((action) => action.lead.id !== id);
    mockStore.notes = mockStore.notes.filter((note) => note.leadId !== id);
    return respond(undefined);
  },
};
