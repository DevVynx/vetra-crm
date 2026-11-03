import { v7 as uuidv7 } from "uuid";

import { InvalidStageOrderError, StageCannotBeDeletedError, StageNotFoundError } from "./errors";

export type StageRole = "entry" | "middle" | "closing" | "archive";

export type Stage = {
  id: string;
  name: string;
  color: string;
  role: StageRole;
  position: number;
};

type NewStage = Pick<Stage, "name" | "color"> & { role: Extract<StageRole, "middle" | "archive"> };

const PRESET: Omit<Stage, "id">[] = [
  { name: "Prospectado", color: "#71717a", role: "entry", position: 0 },
  { name: "Abordagem enviada", color: "#3b82f6", role: "middle", position: 1 },
  { name: "Conversando", color: "#8b5cf6", role: "middle", position: 2 },
  { name: "Reunião", color: "#d946ef", role: "middle", position: 3 },
  { name: "Proposta enviada", color: "#f59e0b", role: "middle", position: 4 },
  { name: "Fechado", color: "#22c55e", role: "closing", position: 5 },
  { name: "Sem resposta", color: "#a1a1aa", role: "archive", position: 0 },
  { name: "Perdido", color: "#ef4444", role: "archive", position: 1 },
];

const byPosition = (a: Stage, b: Stage) => a.position - b.position;

const withPositions = (stages: Stage[]): Stage[] =>
  stages.map((stage, position) => ({ ...stage, position }));

function createPreset(): Stage[] {
  return PRESET.map((stage) => ({ ...stage, id: uuidv7() }));
}

function funnelOf(stages: Stage[]): Stage[] {
  return stages.filter((stage) => stage.role !== "archive").sort(byPosition);
}

function archiveOf(stages: Stage[]): Stage[] {
  return stages.filter((stage) => stage.role === "archive").sort(byPosition);
}

function ordered(stages: Stage[]): Stage[] {
  return [...funnelOf(stages), ...archiveOf(stages)];
}

function find(stages: Stage[], id: string): Stage {
  const stage = stages.find((item) => item.id === id);
  if (!stage) throw new StageNotFoundError();
  return stage;
}

// A new middle stage goes right before the closing stage; a new archive stage goes last.
function add(
  stages: Stage[],
  { name, color, role }: NewStage
): { created: Stage; layout: Stage[] } {
  const id = uuidv7();
  const fresh: Stage = { id, name, color, role, position: 0 };

  const funnel = funnelOf(stages);
  const layout =
    role === "archive"
      ? [...funnel, ...withPositions([...archiveOf(stages), fresh])]
      : [
          ...withPositions([...funnel.slice(0, -1), fresh, ...funnel.slice(-1)]),
          ...archiveOf(stages),
        ];

  return { created: find(layout, id), layout };
}

const sameIds = (ids: string[], stages: Stage[]) =>
  ids.length === stages.length &&
  new Set(ids).size === ids.length &&
  stages.every((stage) => ids.includes(stage.id));

// Entry stays first and closing stays last; only middle and archive stages move.
function reorder(stages: Stage[], middleIds: string[], archiveIds: string[]): Stage[] {
  const funnel = funnelOf(stages);
  const middle = funnel.filter((stage) => stage.role === "middle");
  const archive = archiveOf(stages);
  if (!sameIds(middleIds, middle) || !sameIds(archiveIds, archive)) {
    throw new InvalidStageOrderError();
  }

  const entry = funnel[0] as Stage;
  const closing = funnel.at(-1) as Stage;
  return [
    ...withPositions([entry, ...middleIds.map((id) => find(stages, id)), closing]),
    ...withPositions(archiveIds.map((id) => find(stages, id))),
  ];
}

// Where the leads of a deleted stage go: the previous stage in its own list.
function deletionTargetOf(stages: Stage[], id: string): Stage {
  const stage = find(stages, id);

  if (stage.role === "middle") {
    const funnel = funnelOf(stages);
    if (funnel.filter((item) => item.role === "middle").length <= 1) {
      throw new StageCannotBeDeletedError("lastMiddle");
    }
    return funnel[funnel.indexOf(stage) - 1] as Stage;
  }

  if (stage.role === "archive") {
    const archive = archiveOf(stages);
    if (archive.length <= 1) throw new StageCannotBeDeletedError("lastArchive");
    const index = archive.indexOf(stage);
    return (archive[index - 1] ?? archive[index + 1]) as Stage;
  }

  throw new StageCannotBeDeletedError(stage.role);
}

function remove(stages: Stage[], id: string): Stage[] {
  const remaining = stages.filter((stage) => stage.id !== id);
  return [...withPositions(funnelOf(remaining)), ...withPositions(archiveOf(remaining))];
}

export const stageDomain = {
  createPreset,
  ordered,
  find,
  add,
  reorder,
  deletionTargetOf,
  remove,
};
