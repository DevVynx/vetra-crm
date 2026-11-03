import {
  createLeadNoteRequestSchema,
  leadNoteParamsSchema,
  leadParamsSchema,
  restoreLeadNoteRequestSchema,
  updateLeadNoteRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listLeadNotes: validation({ params: leadParamsSchema }),
  createLeadNote: validation({ params: leadParamsSchema, body: createLeadNoteRequestSchema }),
  updateLeadNote: validation({ params: leadNoteParamsSchema, body: updateLeadNoteRequestSchema }),
  deleteLeadNote: validation({ params: leadNoteParamsSchema }),
  restoreLeadNote: validation({ body: restoreLeadNoteRequestSchema }),
};

export default v;
