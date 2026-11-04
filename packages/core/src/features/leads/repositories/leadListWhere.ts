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

export const leadSearchSql = (search: string) =>
  search
    ? or(
        ...[leadsTable.businessName, leadsTable.contactName, leadsTable.niche, leadsTable.city].map(
          (column) => containsSql(sql`${column}`, search)
        )
      )
    : undefined;

// Which leads a list shows, shared by its page and by "select all".
export const leadListWhere = ({ visibleStageIds, search, filters, timeZone }: LeadListScope) =>
  and(
    inArray(leadsTable.stageId, visibleStageIds),
    leadSearchSql(search),
    filtersToSql(filters, leadFilterColumns, timeZone)
  );
