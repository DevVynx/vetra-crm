import { and, inArray, leadsTable, nextActionsTable, or, qualified, sql } from "@vetra/database";

import {
  containsSql,
  type Filter,
  type FilterColumns,
  filtersToSql,
} from "../../../shared/filters";

export type LeadListScope = {
  visibleStageIds: string[];
  search: string;
  filters: Filter[];
  timeZone: string;
};

const hasNextAction = sql`EXISTS (SELECT 1 FROM ${nextActionsTable} WHERE ${nextActionsTable.leadId} = ${qualified(leadsTable.id)})`;

const leadFilterColumns: FilterColumns = {
  stage: { kind: "select", expression: sql`${leadsTable.stageId}` },
  niche: { kind: "select", expression: sql`${leadsTable.niche}` },
  city: { kind: "select", expression: sql`${leadsTable.city}` },
  next_action: { kind: "boolean", expression: hasNextAction },
  last_contact: { kind: "date", expression: sql`${leadsTable.lastContactAt}` },
  prospected_at: { kind: "date", expression: sql`${leadsTable.prospectedAt}` },
};

const MIN_PHONE_DIGITS = 4;

// A number is found by any part of it, however it is typed ("(31) 98888", "98888-77"), whether it
// was saved with the ninth digit or not: the key is the saved number without it.
function phoneMatchSql(search: string) {
  const digits = search.replace(/\D/g, "");
  if (digits.length < MIN_PHONE_DIGITS) return [];

  const pattern = `%${digits}%`;

  return [sql`${leadsTable.phone} like ${pattern}`, sql`${leadsTable.phoneKey} like ${pattern}`];
}

export const leadSearchSql = (search: string) =>
  search
    ? or(
        ...[leadsTable.businessName, leadsTable.contactName, leadsTable.niche, leadsTable.city].map(
          (column) => containsSql(sql`${column}`, search)
        ),
        ...phoneMatchSql(search)
      )
    : undefined;

// Which leads a list shows, shared by its page and by "select all".
export const leadListWhere = ({ visibleStageIds, search, filters, timeZone }: LeadListScope) =>
  and(
    inArray(leadsTable.stageId, visibleStageIds),
    leadSearchSql(search),
    filtersToSql(filters, leadFilterColumns, timeZone)
  );
