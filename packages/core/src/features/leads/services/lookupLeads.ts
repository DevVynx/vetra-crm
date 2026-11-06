import { canonicalPhoneOf } from "../../../shared/phone";
import { nextActionRepositories } from "../../next-actions/repositories";
import { type LeadLookupRow, leadRepositories } from "../repositories";

export type LeadLookupQuery = {
  slugs: string[];
  phones: string[];
  name: string | null;
  city: string | null;
};

export type LeadLookupMatchKind = "slug" | "phone" | "name_and_city" | "name";

export type LeadFollowUpState = {
  step: number;
  status: "queued" | "scheduled" | "cancelled";
};

export type LeadLookupHit = LeadLookupRow & {
  matchedBy: LeadLookupMatchKind[];
  followUps: LeadFollowUpState[];
};

// The follow-ups the pipeline already gave each lead, so it sends only the steps that are missing.
export async function followUpStatesOf(leadIds: string[]) {
  const rows = await nextActionRepositories.findQueuedFollowUpStates(leadIds);

  return (leadId: string): LeadFollowUpState[] =>
    rows.filter((row) => row.leadId === leadId).map(({ step, status }) => ({ step, status }));
}

// A slug or a phone is a sure match. The same name in the same city, or part of a name, is only a
// hint, because two different businesses can share them.
export async function lookupLeads(query: LeadLookupQuery): Promise<LeadLookupHit[]> {
  const phoneKeys = query.phones.map(canonicalPhoneOf).filter((key) => key !== "");
  const nameAndCity = query.name && query.city ? { name: query.name, city: query.city } : null;
  const nameContains = query.name && !query.city ? query.name : null;

  if (query.slugs.length === 0 && phoneKeys.length === 0 && !nameAndCity && !nameContains) {
    return [];
  }

  const matches = await leadRepositories.findLeadsForLookup({
    slugs: query.slugs,
    phoneKeys,
    nameAndCity,
    nameContains,
  });

  const followUpsOf = await followUpStatesOf(matches.map((match) => match.id));

  return matches.map(
    ({ matchedBySlug, matchedByPhone, matchedByNameAndCity, matchedByName, ...lead }) => {
      const matchedBy: LeadLookupMatchKind[] = [];
      if (matchedBySlug) matchedBy.push("slug");
      if (matchedByPhone) matchedBy.push("phone");
      if (matchedByNameAndCity) matchedBy.push("name_and_city");
      if (matchedByName) matchedBy.push("name");

      return { ...lead, matchedBy, followUps: followUpsOf(lead.id) };
    }
  );
}
