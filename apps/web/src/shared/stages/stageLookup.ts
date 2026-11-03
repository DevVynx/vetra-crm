import type { Stage } from "@vetra/contracts";

export type StageLookup = {
  stages: Stage[];
  funnel: Stage[];
  middle: Stage[];
  archive: Stage[];
  entry: Stage;
  closing: Stage;
  lastMiddle: Stage;
  find: (id: string) => Stage | undefined;
  nameOf: (id: string) => string;
  colorOf: (id: string) => string;
  isArchive: (id: string) => boolean;
  isClosing: (id: string) => boolean;
  isLive: (id: string) => boolean;
  funnelIndexOf: (id: string) => number;
};

const FALLBACK_COLOR = "#a1a1aa";

export function buildStageLookup(stages: Stage[]): StageLookup | null {
  const byPosition = (a: Stage, b: Stage) => a.position - b.position;
  const funnel = stages.filter((stage) => stage.role !== "archive").sort(byPosition);
  const archive = stages.filter((stage) => stage.role === "archive").sort(byPosition);
  const entry = funnel.find((stage) => stage.role === "entry");
  const closing = funnel.find((stage) => stage.role === "closing");
  const middle = funnel.filter((stage) => stage.role === "middle");
  const lastMiddle = middle.at(-1);
  if (!entry || !closing || !lastMiddle) return null;

  const find = (id: string) => stages.find((stage) => stage.id === id);

  return {
    stages: [...funnel, ...archive],
    funnel,
    middle,
    archive,
    entry,
    closing,
    lastMiddle,
    find,
    nameOf: (id) => find(id)?.name ?? "Etapa removida",
    colorOf: (id) => find(id)?.color ?? FALLBACK_COLOR,
    isArchive: (id) => find(id)?.role === "archive",
    isClosing: (id) => find(id)?.role === "closing",
    isLive: (id) => {
      const role = find(id)?.role;
      return role === "entry" || role === "middle";
    },
    funnelIndexOf: (id) => funnel.findIndex((stage) => stage.id === id),
  };
}
