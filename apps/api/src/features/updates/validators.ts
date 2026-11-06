import { getUpdatesQuerySchema } from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  getUpdates: validation({ query: getUpdatesQuerySchema }),
};

export default v;
