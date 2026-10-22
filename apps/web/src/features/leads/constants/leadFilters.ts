import type { LeadListFilter, LeadStage } from "@vetra/contracts";

export const liveStages = [
  "prospected",
  "demo_published",
  "approach_sent",
  "conversing",
  "meeting",
  "proposal_sent",
] as const satisfies readonly LeadStage[];

export const isLiveStage = (stage: LeadStage) =>
  (liveStages as readonly LeadStage[]).includes(stage);

export const leadFilterLabels: Partial<Record<LeadListFilter, string>> = {
  all: "Todos",
  without_next_action: "Sem próxima ação",
  archived: "Arquivados",
};
