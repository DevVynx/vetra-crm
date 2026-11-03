import type {
  CreateStageRequest,
  CreateStageResponse,
  DeleteStageResponse,
  ListStageLeadCountsResponse,
  ListStagesResponse,
  ReorderStagesRequest,
  ReorderStagesResponse,
  Stage,
  UpdateStageRequest,
  UpdateStageResponse,
} from "@vetra/contracts";

import { mockLeads } from "./fixtures";
import {
  archiveStagesOf,
  findStage,
  funnelStagesOf,
  mockStages,
  orderedStages,
} from "./stageRules";
import { respond } from "./store";

const replaceStage = (updated: Stage) => {
  mockStages[mockStages.findIndex((stage) => stage.id === updated.id)] = updated;
};

const renumber = (stages: Stage[]) =>
  stages.forEach((stage, position) => replaceStage({ ...stage, position }));

const moveLeads = (fromId: string, toId: string) => {
  mockLeads.forEach((lead, index) => {
    mockLeads[index] = {
      ...lead,
      stage: lead.stage === fromId ? toId : lead.stage,
      stoppedAtStage: lead.stoppedAtStage === fromId ? toId : lead.stoppedAtStage,
    };
  });
};

const destinationFor = (stage: Stage): Stage => {
  if (stage.role === "middle") {
    const funnel = funnelStagesOf();
    const middleCount = funnel.filter((item) => item.role === "middle").length;
    if (middleCount <= 1) throw new Error("The last middle stage cannot be deleted");
    return funnel[funnel.findIndex((item) => item.id === stage.id) - 1] as Stage;
  }

  if (stage.role === "archive") {
    const archive = archiveStagesOf();
    if (archive.length <= 1) throw new Error("The last archive stage cannot be deleted");
    const index = archive.findIndex((item) => item.id === stage.id);
    return (archive[index - 1] ?? archive[index + 1]) as Stage;
  }

  throw new Error("The entry and closing stages cannot be deleted");
};

export const stagesMockApi = {
  listStages(): Promise<ListStagesResponse> {
    return respond({ stages: orderedStages() });
  },

  listStageLeadCounts(): Promise<ListStageLeadCountsResponse> {
    const counts: Record<string, number> = Object.fromEntries(
      mockStages.map((stage) => [stage.id, 0])
    );
    mockLeads.forEach((lead) => {
      counts[lead.stage] = (counts[lead.stage] ?? 0) + 1;
    });
    return respond({ counts });
  },

  createStage({ name, color, role }: CreateStageRequest): Promise<CreateStageResponse> {
    const id = `stage-${crypto.randomUUID().slice(0, 8)}`;

    if (role === "archive") {
      const created: Stage = { id, name, color, role, position: archiveStagesOf().length };
      mockStages.push(created);
      return respond(created);
    }

    const funnel = funnelStagesOf();
    const closing = funnel[funnel.length - 1] as Stage;
    const created: Stage = { id, name, color, role, position: closing.position };
    mockStages.push(created);
    renumber([...funnel.slice(0, -1), created, closing]);
    return respond(findStage(id));
  },

  updateStage(id: string, { name, color }: UpdateStageRequest): Promise<UpdateStageResponse> {
    const updated = { ...findStage(id), name, color };
    replaceStage(updated);
    return respond(updated);
  },

  reorderStages({ middleIds, archiveIds }: ReorderStagesRequest): Promise<ReorderStagesResponse> {
    const funnel = funnelStagesOf();
    const entry = funnel[0] as Stage;
    const closing = funnel[funnel.length - 1] as Stage;
    renumber([entry, ...middleIds.map(findStage), closing]);
    renumber(archiveIds.map(findStage));
    return respond({ stages: orderedStages() });
  },

  deleteStage(id: string): Promise<DeleteStageResponse> {
    const stage = findStage(id);
    const destination = destinationFor(stage);
    moveLeads(stage.id, destination.id);
    mockStages.splice(mockStages.indexOf(stage), 1);
    renumber(funnelStagesOf());
    renumber(archiveStagesOf());
    return respond(undefined);
  },
};
