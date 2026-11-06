import { completeNextAction } from "./completeNextAction";
import { createNextAction } from "./createNextAction";
import { deleteNextAction } from "./deleteNextAction";
import { listLeadNextActions } from "./listLeadNextActions";
import { listNextActions } from "./listNextActions";
import { reopenNextAction } from "./reopenNextAction";
import { restoreNextAction } from "./restoreNextAction";
import { sendNextAction } from "./sendNextAction";
import { updateNextAction } from "./updateNextAction";

export const nextActionServices = {
  completeNextAction,
  createNextAction,
  deleteNextAction,
  listLeadNextActions,
  listNextActions,
  reopenNextAction,
  restoreNextAction,
  sendNextAction,
  updateNextAction,
};
