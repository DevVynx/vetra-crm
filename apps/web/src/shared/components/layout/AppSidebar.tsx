import { Link, useMatchRoute } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";

import vetraIcon from "@/shared/assets/vetra-icon.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { setSearchPaletteOpen } from "@/shared/search/searchPaletteStore";

import { footerNavigation, mainNavigation, type NavigationItem } from "./navigation";

function NavigationMenu({ items }: { items: NavigationItem[] }) {
  const matchRoute = useMatchRoute();

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={Boolean(matchRoute({ to: item.to }))}
            render={<Link to={item.to} />}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function SidebarSearch() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          tooltip="Buscar"
          aria-label="Buscar (Ctrl K)"
          onClick={() => {
            setOpenMobile(false);
            setSearchPaletteOpen(true);
          }}
        >
          <SearchIcon />
          <span className="text-muted-foreground flex-1">Buscar…</span>
          <kbd className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
            Ctrl K
          </kbd>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="p-0 hover:bg-transparent active:bg-transparent"
              render={<Link to="/" />}
            >
              {/* Same box size as the collapsed button, so the logo never moves while the
                  sidebar animates — the wordmark is just clipped by the shrinking width. */}
              <span className="flex size-8 shrink-0 items-center justify-center">
                <img src={vetraIcon} alt="" className="h-8 w-auto" />
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-brand text-2xl leading-none font-semibold tracking-tight">
                  vetra
                </span>
                <span className="bg-sidebar-foreground text-sidebar inline-flex items-center rounded-[3px] px-1 py-0.5 text-[8px] leading-none font-bold tracking-wide">
                  CRM
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-3">
            <SidebarSearch />
            <NavigationMenu items={mainNavigation} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavigationMenu items={footerNavigation} />
      </SidebarFooter>
    </Sidebar>
  );
}
