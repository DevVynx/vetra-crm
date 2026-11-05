import { resolveWhatsappAccountChangeRequestSchema } from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  resolveAccountChange: validation({ body: resolveWhatsappAccountChangeRequestSchema }),
};

export default v;
