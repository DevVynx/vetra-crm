import { useNavigate } from "@tanstack/react-router";
import { SEARCH_MIN_LENGTH } from "@vetra/contracts";
import { useState } from "react";

import { footerNavigation, mainNavigation } from "@/shared/components/layout/navigation";
import { Command, CommandInput, CommandList } from "@/shared/components/ui/command";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useDebouncedCallback } from "@/shared/hooks/useDebouncedCallback";
import { setSearchPaletteOpen } from "@/shared/search/searchPaletteStore";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { normalizeText } from "@/shared/utils/text";

import { searchKinds } from "../constants/searchKinds";
import { useSearch } from "../queries/useSearch";
import { type SearchResultGroup, SearchResultGroups } from "./SearchResultGroups";

const SEARCH_DEBOUNCE_IN_MS = 300;

const pages = [...mainNavigation, ...footerNavigation];

const footerHints = [
  { keys: "↑ ↓", label: "navegar" },
  { keys: "Enter", label: "abrir" },
  { keys: "Esc", label: "fechar" },
];

function StatusMessage({ children }: { children: string }) {
  return <p className="text-muted-foreground px-3 py-6 text-center text-sm">{children}</p>;
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3" aria-hidden>
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="bg-accent h-10 w-full" />
      ))}
    </div>
  );
}

// Lives inside the dialog, which unmounts it on close: that is what clears the query.
export function SearchPaletteContent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const commitTerm = useDebouncedCallback(setTerm, SEARCH_DEBOUNCE_IN_MS);
  const { data, error, isError, isFetching, isPlaceholderData } = useSearch(term);

  const typed = query.trim();
  const isSearching = typed.length >= SEARCH_MIN_LENGTH;
  const isSettled = term === typed && !isFetching && !isPlaceholderData;

  const open = (openResult: () => void) => {
    setSearchPaletteOpen(false);
    openResult();
  };

  const matchingPages = isSearching
    ? pages.filter((page) => normalizeText(page.title).includes(normalizeText(typed)))
    : pages;

  const pageGroup: SearchResultGroup = {
    title: "Páginas",
    items: matchingPages.map((page) => ({
      value: `page:${page.to}`,
      icon: page.icon,
      primary: page.title,
      onSelect: () => open(() => navigate({ to: page.to })),
    })),
  };

  const recordGroups: SearchResultGroup[] =
    isSearching && !isError
      ? (data?.groups ?? []).map(({ kind, items }) => {
          const { title, icon, open: openRecord } = searchKinds[kind];
          return {
            title,
            items: items.map((item) => ({
              value: `${kind}:${item.id}`,
              icon,
              primary: item.primary,
              secondary: item.secondary,
              onSelect: () => open(() => openRecord(navigate, item.targetId)),
            })),
          };
        })
      : [];

  const groups = [pageGroup, ...recordGroups].filter((group) => group.items.length > 0);
  const hasNoResults = isSearching && !isError && isSettled && groups.length === 0;
  const isLoading = isSearching && !isError && !data;

  // cmdk only moves its cursor when it filters by itself. Here the server does, so a new list
  // would keep the old cursor, or none at all, and Enter would do nothing. An empty list reports an
  // empty cursor, which is ignored: cmdk doesn't select again when it goes back to having items.
  const firstValue = groups[0]?.items[0]?.value ?? "";
  const listKey = groups.flatMap((group) => group.items.map((item) => item.value)).join("|");
  const [activeValue, setActiveValue] = useState(firstValue);
  const [previousListKey, setPreviousListKey] = useState(listKey);
  if (listKey !== previousListKey) {
    setPreviousListKey(listKey);
    if (firstValue) setActiveValue(firstValue);
  }

  return (
    <Command
      shouldFilter={false}
      label="Buscar"
      className="min-h-0 flex-1 rounded-none"
      value={activeValue}
      onValueChange={(value) => {
        if (value) setActiveValue(value);
      }}
    >
      {/* Focused on mount, not by the dialog a moment later: Ctrl+K is usually typed straight into. */}
      <CommandInput
        autoFocus
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          commitTerm(value.trim());
        }}
        placeholder="Buscar leads, clientes, projetos, notas…"
      />
      <CommandList className="min-h-0 flex-1 sm:max-h-[min(24rem,60svh)]">
        <SearchResultGroups groups={groups} />
        {isLoading && <ResultsSkeleton />}
        {isError && isSearching && (
          <StatusMessage>{getErrorMessage(error, "Não foi possível buscar agora.")}</StatusMessage>
        )}
        {hasNoResults && <StatusMessage>{`Nenhum resultado para “${typed}”.`}</StatusMessage>}
      </CommandList>
      <div className="text-muted-foreground flex items-center gap-4 border-t px-4 py-2 text-xs">
        {footerHints.map(({ keys, label }) => (
          <span key={keys} className="flex items-center gap-1.5">
            <kbd className="bg-muted rounded px-1.5 py-0.5 font-sans text-[10px] font-medium">
              {keys}
            </kbd>
            {label}
          </span>
        ))}
      </div>
    </Command>
  );
}
