import {
  createCustomerProjectRequestSchema,
  customerParamsSchema,
  customerProjectParamsSchema,
  updateCustomerProjectRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listProjects: validation({ params: customerParamsSchema }),
  createProject: validation({
    params: customerParamsSchema,
    body: createCustomerProjectRequestSchema,
  }),
  updateProject: validation({
    params: customerProjectParamsSchema,
    body: updateCustomerProjectRequestSchema,
  }),
  deleteProject: validation({ params: customerProjectParamsSchema }),
};

export default v;
