import { Link, useMatches } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useCurrentCrumb } from "./PageCrumb";

function usePageHeader() {
  const matches = useMatches();
  const staticData = [...matches].reverse().find((match) => match.staticData.title || match.staticData.parent)?.staticData;
  return { title: staticData?.title, parent: staticData?.parent };
}

export function AppHeader() {
  const { title, parent } = usePageHeader();
  const crumb = useCurrentCrumb();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <SidebarTrigger />
      {parent ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={parent.to} />}>{parent.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb ? (
                <BreadcrumbPage className="font-medium">{crumb}</BreadcrumbPage>
              ) : (
                <Skeleton className="h-4 w-28" />
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <h1 className="text-sm font-medium">{title}</h1>
      )}
    </header>
  );
}
