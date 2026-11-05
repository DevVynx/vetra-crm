import { canonicalPhoneOf } from "../../../shared/phone";
import { LeadPhoneAlreadyExistsError } from "../errors";
import { leadRepositories } from "../repositories";

// Customers are leads too, so this covers both. The unique index is what really guarantees it.
export async function ensurePhoneIsAvailable(phone: string, ownerId?: string): Promise<void> {
  const owner = await leadRepositories.findLeadIdByPhoneKey(canonicalPhoneOf(phone));

  if (owner && owner !== ownerId) throw new LeadPhoneAlreadyExistsError();
}
