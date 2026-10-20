import { Link, useMatchRoute } from "@tanstack/react-router";

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
  SidebarRail,
} from "@/shared/components/ui/sidebar";

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
          <SidebarGroupContent>
            <NavigationMenu items={mainNavigation} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavigationMenu items={footerNavigation} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
