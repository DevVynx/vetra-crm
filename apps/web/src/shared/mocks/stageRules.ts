import type { Stage } from "@vetra/contracts";

export const mockStages: Stage[] = [
  { id: "prospected", name: "Prospectado", color: "#71717a", role: "entry", position: 0 },
  { id: "approach_sent", name: "Abordagem enviada", color: "#3b82f6", role: "middle", position: 1 },
  { id: "conversing", name: "Conversando", color: "#8b5cf6", role: "middle", position: 2 },
  { id: "meeting", name: "Reunião", color: "#d946ef", role: "middle", position: 3 },
  { id: "proposal_sent", name: "Proposta enviada", color: "#f59e0b", role: "middle", position: 4 },
  { id: "won", name: "Fechado", color: "#22c55e", role: "closing", position: 5 },
  { id: "no_response", name: "Sem resposta", color: "#a1a1aa", role: "archive", position: 0 },
  { id: "lost", name: "Perdido", color: "#ef4444", role: "archive", position: 1 },
];

const byPosition = (a: Stage, b: Stage) => a.position - b.position;

export const funnelStagesOf = (): Stage[] =>
  mockStages.filter((stage) => stage.role !== "archive").sort(byPosition);

export const archiveStagesOf = (): Stage[] =>
  mockStages.filter((stage) => stage.role === "archive").sort(byPosition);

export const orderedStages = (): Stage[] => [...funnelStagesOf(), ...archiveStagesOf()];

export const findStage = (id: string): Stage => {
  const found = mockStages.find((stage) => stage.id === id);
  if (!found) throw new Error(`Stage ${id} not found`);
  return found;
};

const roleOf = (id: string) => mockStages.find((stage) => stage.id === id)?.role;

export const isEntryStageId = (id: string) => roleOf(id) === "entry";
export const isClosingStageId = (id: string) => roleOf(id) === "closing";
export const isArchiveStageId = (id: string) => roleOf(id) === "archive";

export const entryStageId = (): string => {
  const entry = mockStages.find((stage) => stage.role === "entry");
  if (!entry) throw new Error("No entry stage");
  return entry.id;
};

export const closingStageId = (): string => {
  const closing = mockStages.find((stage) => stage.role === "closing");
  if (!closing) throw new Error("No closing stage");
  return closing.id;
};

export const funnelIndexOf = (id: string) => funnelStagesOf().findIndex((stage) => stage.id === id);

export const lastMiddleStageId = (): string | undefined =>
  funnelStagesOf()
    .filter((stage) => stage.role === "middle")
    .at(-1)?.id;

export const isLiveStageId = (id: string) => {
  const role = roleOf(id);
  return role === "entry" || role === "middle";
};

export const stageAfterEntryId = (): string | undefined => funnelStagesOf()[1]?.id;
