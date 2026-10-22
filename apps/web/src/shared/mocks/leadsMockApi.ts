import {
  type CloseLeadRequest,
  type CreateLeadNoteRequest,
  type CreateLeadRequest,
  type LeadDetail,
  type LeadListFilter,
  leadListFilterSchema,
  type LeadNote,
  type LeadSummary,
  type ListLeadNotesResponse,
  type ListLeadsQuery,
  type ListLeadsResponse,
  type ListNextActionsResponse,
  liveStageSchema,
  type UpdateLeadNoteRequest,
  type UpdateLeadRequest,
  type UpdateLeadStageRequest,
} from "@vetra/contracts";

import { addMockLead, lastContactFor, leadContactFor, mockLeads, updateMockLead } from "./fixtures";
import { mockStore, normalizeText, openWonDeal, paginate, respond } from "./store";


const isLive = (lead: LeadSummary) => liveStageSchema.safeParse(lead.stage).success;

const nextActionOf = (leadId: string) =>
  mockStore.nextActions
    .filter((action) => action.lead.id === leadId)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];

const matchesFilter = (lead: LeadSummary, filter: LeadListFilter) => {
  switch (filter) {
    case "all":
      return isLive(lead);
    case "without_next_action":
      return isLive(lead) && !nextActionOf(lead.id);
    case "archived":
      return lead.stage === "lost" || lead.stage === "no_response";
    default:
      return lead.stage === filter;
  }
};

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
  listLeads({ q, filter, page, pageSize }: ListLeadsQuery): Promise<ListLeadsResponse> {
    const items = mockLeads
      .filter((lead) => matchesFilter(lead, filter) && matchesSearch(lead, q))
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

    const counts = Object.fromEntries(
      leadListFilterSchema.options.map((option) => [
        option,
        mockLeads.filter((lead) => matchesFilter(lead, option)).length,
      ])
    ) as ListLeadsResponse["counts"];

    return respond({ ...paginate(items, page, pageSize), counts });
  },

  getLead(id: string): Promise<LeadDetail> {
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

  createLeadNote(leadId: string, { content }: CreateLeadNoteRequest): Promise<LeadNote> {
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

  updateLeadNote(noteId: string, { content }: UpdateLeadNoteRequest): Promise<LeadNote> {
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

  updateLeadStage(id: string, { stage }: UpdateLeadStageRequest): Promise<LeadSummary> {
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

  closeLead(id: string, { closedValueInCents, firstInstallmentDueAt }: CloseLeadRequest): Promise<LeadSummary> {
    const lead = findLead(id);
    openWonDeal(id, closedValueInCents, firstInstallmentDueAt);
    mockStore.nextActions = mockStore.nextActions.filter((action) => action.lead.id !== id);
    const closed: LeadSummary = { ...lead, stage: "won", stoppedAtStage: null };
    mockLeads[mockLeads.indexOf(lead)] = closed;
    return respond(closed);
  },

  createLead(request: CreateLeadRequest): Promise<LeadSummary> {
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
