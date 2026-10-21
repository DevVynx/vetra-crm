import { useMatches } from "@tanstack/react-router";

import { SidebarTrigger } from "@/shared/components/ui/sidebar";

function usePageTitle() {
  const matches = useMatches();
  return [...matches].reverse().find((match) => match.staticData.title)?.staticData.title;
}

export function AppHeader() {
  const title = usePageTitle();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <SidebarTrigger />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  );
}
