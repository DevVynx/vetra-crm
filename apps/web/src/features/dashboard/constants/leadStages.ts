import type { LeadStage } from "@vetra/contracts";

export const leadStageLabels: Record<LeadStage, string> = {
  prospected: "Prospectado",
  demo_published: "Demo publicado",
  approach_sent: "Abordagem enviada",
  conversing: "Conversando",
  meeting: "Reunião",
  proposal_sent: "Proposta enviada",
  won: "Fechado",
  lost: "Perdido",
  no_response: "Sem resposta",
};

// Returns a CSS variable rather than a Tailwind class so charts (SVG fill) can use it too;
// the variable names in index.css match the LeadStage values on purpose.
export const leadStageColor = (stage: LeadStage) => `var(--stage-${stage})`;

export const funnelStages: LeadStage[] = [
  "prospected",
  "demo_published",
  "approach_sent",
  "conversing",
  "meeting",
  "proposal_sent",
  "won",
];
