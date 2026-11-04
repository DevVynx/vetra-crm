import { getRouteApi, useNavigate } from "@tanstack/react-router";
import type { CustomerSortField, Filter } from "@vetra/contracts";
import { HandshakeIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";

import { ActiveFilters } from "@/shared/components/filters/ActiveFilters";
import { FilterButton } from "@/shared/components/filters/FilterButton";
import { useFilterController } from "@/shared/components/filters/useFilterController";
import { Pagination } from "@/shared/components/Pagination";
import { SearchField } from "@/shared/components/SearchField";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SortButton } from "@/shared/components/sort/SortButton";
import type { SortValue } from "@/shared/components/sort/types";
import { useSortController } from "@/shared/components/sort/useSortController";
import { Button } from "@/shared/components/ui/button";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { useHotkey } from "@/shared/hooks/useHotkey";
import { useListNavigation } from "@/shared/hooks/useListNavigation";
import { TABLE_MIN_HEIGHT, useTablePageSize } from "@/shared/hooks/useTablePageSize";
import { cn } from "@/shared/utils/cn";

import { buildCustomerFilterFields } from "../constants/customerFilterFields";
import { customerSortOptions, DEFAULT_CUSTOMER_SORT_FIELD } from "../constants/customerSortOptions";
import { useCustomerFilterOptions } from "../queries/useCustomerFilterOptions";
import { useCustomers } from "../queries/useCustomers";
import { CreateCustomerSheet } from "./CreateCustomerSheet";
import { CustomersTable, CustomersTableSkeleton } from "./CustomersTable";

const SEARCH_DEBOUNCE_IN_MS = 300;

const route = getRouteApi("/_app/customers/");

const NO_FILTERS: Filter[] = [];

const focusSearch = () => document.querySelector<HTMLInputElement>("[data-search-field]")?.focus();

export function CustomersPage() {
  const search = route.useSearch();
  const { q = "", filters = NO_FILTERS, page = 1, sort, direction } = search;
  const order = sort && direction ? { field: sort, direction } : undefined;
  const navigate = route.useNavigate();
  const [searchText, setSearchText] = useState(q);
  const [isCreating, setIsCreating] = useState(false);
  const navigateToCustomer = useNavigate();
  const { ref: tableRef, pageSize } = useTablePageSize();
  const { data, isPending, isPlaceholderData } = useCustomers(
    { q, filters, sort: order?.field, direction: order?.direction, page, pageSize },
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

  const changeSort = (next: SortValue<CustomerSortField> | undefined) =>
    navigate({
      search: (previous) => ({
        ...previous,
        sort: next?.field,
        direction: next?.direction,
        page: undefined,
      }),
    });

  const changePage = (next: number) =>
    navigate({ search: (previous) => ({ ...previous, page: next === 1 ? undefined : next }) });

  const clearFilters = () => {
    setSearchText("");
    navigate({ search: (previous) => ({ sort: previous.sort, direction: previous.direction }) });
  };

  const niches = useCustomerFilterOptions("niche");
  const cities = useCustomerFilterOptions("city");
  const filterFields = buildCustomerFilterFields({
    niches: niches.data?.items ?? [],
    cities: cities.data?.items ?? [],
    isLoading: niches.isPending || cities.isPending,
  });

  const filtering = useFilterController({
    fields: filterFields,
    value: filters,
    onChange: changeFilters,
  });

  const sorting = useSortController({
    options: customerSortOptions,
    defaultField: DEFAULT_CUSTOMER_SORT_FIELD,
    value: order,
    onChange: changeSort,
  });

  const hasActiveFilters = q !== "" || filters.length > 0;
  const customers = data?.items ?? [];

  const activeIndex = useListNavigation({
    count: customers.length,
    resetKey: `${q}|${JSON.stringify(filters)}|${sort}|${direction}|${page}`,
    onActivate: (index) => {
      const customer = customers[index];
      if (customer) {
        navigateToCustomer({ to: "/customers/$customerId", params: { customerId: customer.id } });
      }
    },
  });

  useHotkey("n", () => setIsCreating(true));
  useHotkey("/", focusSearch);

  return (
    <div className="flex h-full min-h-[32rem] flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
        <div className="flex flex-wrap gap-2">
          <FilterButton controller={filtering} />
          <SortButton controller={sorting} />
          <Button
            variant="outline"
            className="dark:bg-background font-semibold"
            title="Novo cliente (N)"
            onClick={() => setIsCreating(true)}
          >
            <UserPlusIcon />
            Novo cliente
          </Button>
        </div>
        <CreateCustomerSheet open={isCreating} onOpenChange={setIsCreating} />
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
            <CustomersTableSkeleton rows={pageSize} />
          ) : data.items.length === 0 ? (
            <div className="p-4">
              <SectionEmpty
                icon={HandshakeIcon}
                title={hasActiveFilters ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
                description={
                  hasActiveFilters
                    ? "Tente outra busca ou limpe os filtros."
                    : "Quando um lead fechar, ele aparece aqui."
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
            <CustomersTable
              customers={data.items}
              activeIndex={activeIndex}
              isFull={data.items.length >= pageSize}
            />
          )}
        </div>
      </div>

      <div className="min-h-7">
        {data && (
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            noun={{ singular: "cliente", plural: "clientes" }}
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}
