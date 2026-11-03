import type {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@vetra/contracts";

import { respond } from "./store";

const mockProfile: GetProfileResponse = { name: "Vinícius" };

export const profileMockApi = {
  getProfile(): Promise<GetProfileResponse> {
    return respond(mockProfile);
  },

  updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    mockProfile.name = request.name;
    return respond(mockProfile);
  },
};
