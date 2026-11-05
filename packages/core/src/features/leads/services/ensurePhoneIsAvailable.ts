import { isUniqueViolation } from "@vetra/database";

import { canonicalPhoneOf } from "../../../shared/phone";
import { LeadPhoneAlreadyExistsError } from "../errors";
import { leadRepositories } from "../repositories";

// Customers are leads too, so this covers both. The unique index is what really guarantees it.
export async function ensurePhoneIsAvailable(phone: string, ownerId?: string): Promise<void> {
  const owner = await leadRepositories.findLeadIdByPhoneKey(canonicalPhoneOf(phone));

  if (owner && owner !== ownerId) throw new LeadPhoneAlreadyExistsError();
}

// The check above can lose a race against another request, and then the unique index answers.
export async function withUniquePhone<Result>(run: () => Promise<Result>): Promise<Result> {
  try {
    return await run();
  } catch (error) {
    if (isUniqueViolation(error, "leads_phone_key_idx")) throw new LeadPhoneAlreadyExistsError();
    throw error;
  }
}
