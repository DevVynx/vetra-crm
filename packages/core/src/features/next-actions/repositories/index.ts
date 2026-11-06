import { claimNextActionForSending } from "./claimNextActionForSending";
import { deleteFollowUpsOfLead } from "./deleteFollowUpsOfLead";
import { deleteNextAction } from "./deleteNextAction";
import { deleteNextActionsOfLeads } from "./deleteNextActionsOfLeads";
import { failStaleSending } from "./failStaleSending";
import { findAutoSendCandidates } from "./findAutoSendCandidates";
import { findCompletedAction } from "./findCompletedAction";
import { findNextActions } from "./findNextActions";
import { insertNextAction } from "./insertNextAction";
import { moveNextActionToCompleted } from "./moveNextActionToCompleted";
import { recordSendProgress } from "./recordSendProgress";
import { releaseNextActionSending } from "./releaseNextActionSending";
import { reopenCompletedAction } from "./reopenCompletedAction";
import { updateNextAction } from "./updateNextAction";

export const nextActionRepositories = {
  claimNextActionForSending,
  deleteNextAction,
  deleteFollowUpsOfLead,
  deleteNextActionsOfLeads,
  failStaleSending,
  findAutoSendCandidates,
  findCompletedAction,
  findNextActions,
  insertNextAction,
  moveNextActionToCompleted,
  recordSendProgress,
  releaseNextActionSending,
  reopenCompletedAction,
  updateNextAction,
};
