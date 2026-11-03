import { updateProfileRequestSchema } from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  getProfile: validation({}),
  updateProfile: validation({ body: updateProfileRequestSchema }),
};

export default v;
