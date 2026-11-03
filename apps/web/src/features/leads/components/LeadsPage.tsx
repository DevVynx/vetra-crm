import { getRouteApi, useNavigate } from "@tanstack/react-router";
import type { Filter } from "@vetra/contracts";
import { ListChecksIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { useState } from "react";

import { ActiveFilters } from "@/shared/components/filters/ActiveFilters";
import { FilterButton } from "@/shared/components/filters/FilterButton";
import { useFilterController } from "@/shared/components/filters/useFilterController";
import { Pagination } from "@/shared/components/Pagination";
import { SearchField } from "@/shared/components/SearchField";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { Button } from "@/shared/components/ui/button";
import { selectedChoiceClass } from "@/shared/constants/choiceStyles";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { useHotkey } from "@/shared/hooks/useHotkey";
import { useListNavigation } from "@/shared/hooks/useListNavigation";
import { TABLE_MIN_HEIGHT, useTablePageSize } from "@/shared/hooks/useTablePageSize";
import { useStages } from "@/shared/stages/useStages";
import { cn } from "@/shared/utils/cn";

import { buildLeadFilterFields } from "../constants/leadFilterFields";
import { useLeadFilterOptions } from "../queries/useLeadFilterOptions";
import { useLeads } from "../queries/useLeads";
import { CreateLeadSheet } from "./CreateLeadSheet";
import { LeadsBulkBar } from "./LeadsBulkBar";
import { LeadsTable, LeadsTableSkeleton } from "./LeadsTable";

const SEARCH_DEBOUNCE_IN_MS = 300;

const route = getRouteApi("/_app/leads/");

const NO_FILTERS: Filter[] = [];

const focusSearch = () => document.querySelector<HTMLInputElement>("[data-search-field]")?.focus();

export function LeadsPage() {
  const search = route.useSearch();
  const { q = "", filters = NO_FILTERS, page = 1 } = search;
  const navigate = route.useNavigate();
  const [searchText, setSearchText] = useState(q);
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const navigateToLead = useNavigate();
  const { ref: tableRef, pageSize } = useTablePageSize();
  const { data, isPending, isPlaceholderData } = useLeads(
    { q, filters, page, pageSize },
    { enabled: pageSize > 0 }
  );

  const commitSearch = useDebouncedCallback((value: string) => {
    navigate({
      search: (previous) => ({ ...previous, q: value || undefined, page: undefined }),
      replace: true,
    });
  }, SEARCH_DEBOUNCE_IN_MS);

  const changeFilters = (next: Filter[]) =>
    navigate({
      search: (previous) => ({
        ...previous,
        filters: next.length > 0 ? next : undefined,
        page: undefined,
      }),
    });

  const changePage = (next: number) =>
    navigate({ search: (previous) => ({ ...previous, page: next === 1 ? undefined : next }) });

  const clearFilters = () => {
    setSearchText("");
    navigate({ search: {} });
  };

  const niches = useLeadFilterOptions("niche");
  const cities = useLeadFilterOptions("city");
  const stages = useStages();
  const filterFields = buildLeadFilterFields({
    stages: stages.stages,
    niches: niches.data?.items ?? [],
    cities: cities.data?.items ?? [],
    isLoading: niches.isPending || cities.isPending,
  });

  const filtering = useFilterController({
    fields: filterFields,
    value: filters,
    onChange: changeFilters,
  });

  const hasActiveFilters = q !== "" || filters.length > 0;
  const leads = data?.items ?? [];

  const stopSelecting = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const toggleLead = (leadId: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (!next.delete(leadId)) next.add(leadId);
      return next;
    });

  const togglePage = (leadIds: string[]) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = leadIds.every((leadId) => next.has(leadId));
      leadIds.forEach((leadId) => (allSelected ? next.delete(leadId) : next.add(leadId)));
      return next;
    });

  const activeIndex = useListNavigation({
    count: leads.length,
    resetKey: `${q}|${JSON.stringify(filters)}|${page}`,
    onActivate: (index) => {
      const lead = leads[index];
      if (!lead) return;
      if (isSelecting) toggleLead(lead.id);
      else navigateToLead({ to: "/leads/$leadId", params: { leadId: lead.id } });
    },
  });

  useHotkey("n", () => setIsCreating(true));
  useHotkey("/", focusSearch);
  useHotkey("Escape", stopSelecting, isSelecting);
  useHotkey(
    " ",
    () => leads[activeIndex] && toggleLead(leads[activeIndex].id),
    isSelecting && activeIndex >= 0
  );

  return (
    <div className="relative flex h-full min-h-[32rem] flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Leads</h2>
        <div className="flex gap-2">
          <FilterButton controller={filtering} />
          <Button
            variant="outline"
            className={cn("dark:bg-background font-semibold", isSelecting && selectedChoiceClass)}
            aria-pressed={isSelecting}
            onClick={isSelecting ? stopSelecting : () => setIsSelecting(true)}
          >
            <ListChecksIcon />
            {isSelecting ? "Concluir seleção" : "Selecionar"}
          </Button>
          <Button
            variant="outline"
            className="dark:bg-background font-semibold"
            title="Novo lead (N)"
            onClick={() => setIsCreating(true)}
          >
            <UserPlusIcon />
            Novo lead
          </Button>
        </div>
        <CreateLeadSheet open={isCreating} onOpenChange={setIsCreating} />
      </div>

      <div className="flex flex-col gap-3">
        <ActiveFilters controller={filtering} />
        <SearchField
          className="max-w-sm"
          placeholder="Buscar por nome, contato, nicho ou cidade"
          value={searchText}
          onChange={(value) => {
            setSearchText(value);
            commitSearch(value);
          }}
        />
      </div>

      {/* Fills the space left on the screen; the table is laid over it so its rows never
          stretch the page, and pageSize is how many of them fit. */}
      <div
        ref={tableRef}
        style={{ minHeight: TABLE_MIN_HEIGHT }}
        className={cn(
          "bg-card relative flex-1 overflow-hidden rounded-xl border transition-opacity",
          isPlaceholderData && "opacity-60"
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          {isPending || !data ? (
            <LeadsTableSkeleton rows={pageSize} />
          ) : data.items.length === 0 ? (
            <div className="p-4">
              <SectionEmpty
                icon={UsersIcon}
                title={hasActiveFilters ? "Nenhum lead encontrado" : "Nenhum lead ainda"}
                description={
                  hasActiveFilters ? "Tente outra busca ou limpe os filtros." : undefined
                }
              >
                {hasActiveFilters && (
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </SectionEmpty>
            </div>
          ) : (
            <LeadsTable
              leads={data.items}
              activeIndex={activeIndex}
              isFull={data.items.length >= pageSize}
              selection={{
                isSelecting,
                selectedIds,
                onToggle: toggleLead,
                onTogglePage: togglePage,
              }}
            />
          )}
        </div>
      </div>

      {isSelecting && selectedIds.size > 0 && (
        <LeadsBulkBar ids={[...selectedIds]} onDone={stopSelecting} onCancel={stopSelecting} />
      )}

      <div className="min-h-7">
        {data && (
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            noun={{ singular: "lead", plural: "leads" }}
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}
