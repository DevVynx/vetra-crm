import { completeOnboardingRequestSchema, updateProfileRequestSchema } from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  getProfile: validation({}),
  updateProfile: validation({ body: updateProfileRequestSchema }),
  completeOnboarding: validation({ body: completeOnboardingRequestSchema }),
  getPhoto: validation({}),
  savePhoto: validation({}),
  removePhoto: validation({}),
};

export default v;
