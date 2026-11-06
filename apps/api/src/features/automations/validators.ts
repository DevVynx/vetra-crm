import {
  setAutomationLeadsRequestSchema,
  updateAutomationSettingsRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  getAutomationSettings: validation({}),
  updateAutomationSettings: validation({ body: updateAutomationSettingsRequestSchema }),
  getAutomationLeads: validation({}),
  setAutomationLeads: validation({ body: setAutomationLeadsRequestSchema }),
};

export default v;
