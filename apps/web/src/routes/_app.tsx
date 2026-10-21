import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/AppHeader";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SIDEBAR_COOKIE_NAME, SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

// The sidebar persists its state in a cookie but, outside Next.js, never reads it back.
function readSidebarOpen() {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SIDEBAR_COOKIE_NAME}=`));

  return cookie?.split("=")[1] !== "false";
}

const AppLayout = () => (
  <SidebarProvider defaultOpen={readSidebarOpen()} className="h-svh">
    <AppSidebar />
    {/* The inset is the app's frame: it never grows past the viewport, only its content scrolls. */}
    <SidebarInset className="md:border-border min-h-0 overflow-hidden md:border">
      <AppHeader />
      <ScrollArea className="min-h-0 flex-1">
        <Outlet />
      </ScrollArea>
    </SidebarInset>
  </SidebarProvider>
);

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});
