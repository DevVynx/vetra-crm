import { Link, useNavigate } from "@tanstack/react-router";
import type { LeadListItem } from "@vetra/contracts";
import { isBefore, startOfToday } from "date-fns";
import { useEffect } from "react";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import { DefineNextActionPopover } from "@/shared/components/next-actions/DefineNextActionPopover";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatLastContact, formatRelative } from "@/shared/utils/date";

import { isLiveStage } from "../constants/leadFilters";

function NextActionCell({ lead }: { lead: LeadListItem }) {
  if (lead.nextAction) {
    const dueAt = new Date(lead.nextAction.dueAt);
    const isOverdue = isBefore(dueAt, startOfToday());

    return (
      <div className="flex flex-col">
        <span>{lead.nextAction.description}</span>
        <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
          {isOverdue ? formatRelative(dueAt) : formatDayLabel(dueAt)}
        </span>
      </div>
    );
  }

  if (!isLiveStage(lead.stage)) return <span className="text-muted-foreground">—</span>;

  // The popover renders in a portal, but its events still bubble to the clickable row.
  return (
    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <span className="text-warning text-xs">Sem próxima ação</span>
      <DefineNextActionPopover lead={lead} />
    </div>
  );
}

function ColumnHead({ className, children }: { className?: string; children: string }) {
  return <TableHead className={cn("font-semibold", className)}>{children}</TableHead>;
}

export type LeadSelection = {
  isSelecting: boolean;
  selectedIds: ReadonlySet<string>;
  onToggle: (leadId: string) => void;
  onTogglePage: (leadIds: string[]) => void;
};

function TableHeaders({ leads, selection }: { leads: LeadListItem[]; selection?: LeadSelection }) {
  const selectedOnPage = leads.filter((lead) => selection?.selectedIds.has(lead.id)).length;

  return (
    <TableHeader>
      <TableRow>
        {selection?.isSelecting && (
          <TableHead className="w-px pl-4">
            <Checkbox
              aria-label="Selecionar todos desta página"
              checked={leads.length > 0 && selectedOnPage === leads.length}
              indeterminate={selectedOnPage > 0 && selectedOnPage < leads.length}
              onCheckedChange={() => selection.onTogglePage(leads.map((lead) => lead.id))}
            />
          </TableHead>
        )}
        <ColumnHead className={selection?.isSelecting ? undefined : "pl-4"}>Negócio</ColumnHead>
        <ColumnHead className="hidden md:table-cell">Nicho</ColumnHead>
        <ColumnHead className="hidden lg:table-cell">Cidade</ColumnHead>
        <ColumnHead>Etapa</ColumnHead>
        <ColumnHead className="pr-4 lg:pr-2">Próxima ação</ColumnHead>
        <ColumnHead className="hidden lg:table-cell lg:pr-4 lg:whitespace-nowrap xl:pr-2">
          Último contato
        </ColumnHead>
        <ColumnHead className="hidden xl:table-cell xl:w-px xl:pr-4 xl:whitespace-nowrap">
          Prospectado
        </ColumnHead>
      </TableRow>
    </TableHeader>
  );
}

const DEFAULT_SKELETON_ROWS = 8;

export function LeadsTableSkeleton({ rows }: { rows: number }) {
  return (
    <Table>
      <TableHeaders leads={[]} />
      <TableBody>
        {Array.from({ length: rows || DEFAULT_SKELETON_ROWS }, (_, index) => (
          <TableRow key={index}>
            <TableCell colSpan={7}>
              <Skeleton className="h-8 w-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type LeadsTableProps = {
  leads: LeadListItem[];
  activeIndex: number;
  // The page has as many rows as fit: they stretch to use the leftover height.
  isFull: boolean;
  selection: LeadSelection;
};

export function LeadsTable({ leads, activeIndex, isFull, selection }: LeadsTableProps) {
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelector('tr[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Table fillHeight={isFull}>
      <TableHeaders leads={leads} selection={selection} />
      <TableBody lastRowBorder={!isFull}>
        {leads.map((lead, index) => {
          const isSelected = selection.selectedIds.has(lead.id);

          return (
            <TableRow
              key={lead.id}
              className="data-[active=true]:bg-muted/60 cursor-pointer"
              data-active={index === activeIndex}
              data-state={isSelected ? "selected" : undefined}
              onClick={() =>
                selection.isSelecting
                  ? selection.onToggle(lead.id)
                  : navigate({ to: "/leads/$leadId", params: { leadId: lead.id } })
              }
            >
              {selection.isSelecting && (
                <TableCell className="w-px pl-4">
                  <Checkbox
                    aria-label={`Selecionar ${lead.businessName}`}
                    checked={isSelected}
                    onCheckedChange={() => selection.onToggle(lead.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                </TableCell>
              )}
              <TableCell className={selection.isSelecting ? undefined : "pl-4"}>
                <div className="flex items-center gap-3">
                  <BusinessAvatar name={lead.businessName} className="text-xs" />
                  <div className="min-w-0">
                    <Link
                      to="/leads/$leadId"
                      params={{ leadId: lead.id }}
                      className="font-medium hover:underline"
                      onClick={(event) => {
                        if (selection.isSelecting) return event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      {lead.businessName}
                    </Link>
                    {lead.contactName && (
                      <div className="text-muted-foreground text-xs">{lead.contactName}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{lead.niche}</TableCell>
              <TableCell className="hidden lg:table-cell">{lead.city}</TableCell>
              <TableCell>
                <LeadStageBadge stage={lead.stage} />
              </TableCell>
              <TableCell className="pr-4 lg:pr-2">
                <NextActionCell lead={lead} />
              </TableCell>
              <TableCell className="text-muted-foreground hidden lg:table-cell lg:pr-4 lg:whitespace-nowrap xl:pr-2">
                {lead.lastContactAt ? formatLastContact(new Date(lead.lastContactAt)) : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground hidden xl:table-cell xl:w-px xl:pr-4 xl:whitespace-nowrap">
                {formatRelative(new Date(lead.prospectedAt))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
