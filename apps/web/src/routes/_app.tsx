import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SearchPalette } from "@/features/search/components/SearchPalette";
import { AppHeader } from "@/shared/components/layout/AppHeader";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { PageCrumbProvider } from "@/shared/components/layout/PageCrumb";
import { WhatsAppStatusBar } from "@/shared/components/layout/WhatsAppStatusBar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SIDEBAR_COOKIE_NAME, SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { StagesProvider } from "@/shared/stages/StagesProvider";
import { TimeZoneProvider } from "@/shared/time-zone/TimeZoneProvider";

// The sidebar persists its state in a cookie but, outside Next.js, never reads it back.
function readSidebarOpen() {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SIDEBAR_COOKIE_NAME}=`));

  return cookie?.split("=")[1] !== "false";
}

const AppLayout = () => (
  <div className="flex h-svh flex-col">
    <SidebarProvider defaultOpen={readSidebarOpen()} className="min-h-0 flex-1">
      <PageCrumbProvider>
        <AppSidebar />
        <SidebarInset className="md:border-border min-h-0 overflow-hidden md:border md:peer-data-[variant=inset]:mb-0">
          <AppHeader />
          <ScrollArea className="min-h-0 flex-1">
            <TimeZoneProvider>
              <StagesProvider>
                <Outlet />
              </StagesProvider>
            </TimeZoneProvider>
          </ScrollArea>
        </SidebarInset>
        <SearchPalette />
      </PageCrumbProvider>
    </SidebarProvider>
    <WhatsAppStatusBar />
  </div>
);

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});
