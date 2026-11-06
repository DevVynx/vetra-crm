import {
  type AnyColumn,
  db,
  desc,
  eq,
  inArray,
  leadsTable,
  or,
  sql,
  stagesTable,
} from "@vetra/database";

import type { StageRole } from "../../stages/domain";

export type LeadLookupRow = {
  id: string;
  slug: string | null;
  businessName: string;
  city: string;
  phone: string;
  doNotContact: boolean;
  stageName: string;
  stageRole: StageRole;
};

export type LeadLookupMatch = LeadLookupRow & {
  matchedBySlug: boolean;
  matchedByPhone: boolean;
  matchedByNameAndCity: boolean;
  matchedByName: boolean;
};

export type LeadLookupCriteria = {
  slugs: string[];
  phoneKeys: string[];
  nameAndCity: { name: string; city: string } | null;
  // Part of the name of the business, for someone who names a lead that was typed by hand and so
  // has no slug. Only used when there is no city.
  nameContains: string | null;
};

const MAX_MATCHES = 20;

export const lookupColumns = {
  id: leadsTable.id,
  slug: leadsTable.slug,
  businessName: leadsTable.businessName,
  city: leadsTable.city,
  phone: leadsTable.phone,
  doNotContact: leadsTable.doNotContact,
  stageName: stagesTable.name,
  stageRole: stagesTable.role,
};

const sameText = (column: AnyColumn, value: string) =>
  sql`unaccent(lower(${column})) = unaccent(lower(${value}))`;

// Contains, without accents or case. `position` instead of `like`, so a % or _ in what was typed is
// only a character.
const containsText = (column: AnyColumn, value: string) =>
  sql`position(unaccent(lower(${value})) in unaccent(lower(${column}))) > 0`;

// Each way of matching is also selected, so the caller can tell a sure match (slug, phone) from a
// hint (same name in the same city, or part of the name).
export async function findLeadsForLookup({
  slugs,
  phoneKeys,
  nameAndCity,
  nameContains,
}: LeadLookupCriteria): Promise<LeadLookupMatch[]> {
  const bySlug = slugs.length > 0 ? inArray(leadsTable.slug, slugs) : sql`false`;
  const byPhone = phoneKeys.length > 0 ? inArray(leadsTable.phoneKey, phoneKeys) : sql`false`;
  const byNameAndCity = nameAndCity
    ? sql`(${sameText(leadsTable.businessName, nameAndCity.name)} and ${sameText(leadsTable.city, nameAndCity.city)})`
    : sql`false`;
  const byName = nameContains ? containsText(leadsTable.businessName, nameContains) : sql`false`;

  return db
    .select({
      ...lookupColumns,
      matchedBySlug: sql<boolean>`coalesce(${bySlug}, false)`,
      matchedByPhone: sql<boolean>`coalesce(${byPhone}, false)`,
      matchedByNameAndCity: sql<boolean>`coalesce(${byNameAndCity}, false)`,
      matchedByName: sql<boolean>`coalesce(${byName}, false)`,
    })
    .from(leadsTable)
    .innerJoin(stagesTable, eq(stagesTable.id, leadsTable.stageId))
    .where(or(bySlug, byPhone, byNameAndCity, byName))
    .orderBy(desc(leadsTable.prospectedAt))
    .limit(MAX_MATCHES);
}

export async function findLeadLookupRow(id: string): Promise<LeadLookupRow | null> {
  const [row] = await db
    .select(lookupColumns)
    .from(leadsTable)
    .innerJoin(stagesTable, eq(stagesTable.id, leadsTable.stageId))
    .where(eq(leadsTable.id, id));

  return row ?? null;
}
