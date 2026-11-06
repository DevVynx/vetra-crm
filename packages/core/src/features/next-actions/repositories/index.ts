import { deleteNextAction } from "./deleteNextAction";
import { deleteNextActionsOfLeads } from "./deleteNextActionsOfLeads";
import { findCompletedAction } from "./findCompletedAction";
import { findNextActions } from "./findNextActions";
import { insertNextAction } from "./insertNextAction";
import { moveNextActionToCompleted } from "./moveNextActionToCompleted";
import { reopenCompletedAction } from "./reopenCompletedAction";
import { updateNextAction } from "./updateNextAction";

export const nextActionRepositories = {
  deleteNextAction,
  deleteNextActionsOfLeads,
  findCompletedAction,
  findNextActions,
  insertNextAction,
  moveNextActionToCompleted,
  reopenCompletedAction,
  updateNextAction,
};
