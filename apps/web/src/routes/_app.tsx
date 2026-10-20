import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppHeader } from "@/shared/components/layout/AppHeader";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { SIDEBAR_COOKIE_NAME, SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

// The sidebar persists its state in a cookie but, outside Next.js, never reads it back.
function readSidebarOpen() {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SIDEBAR_COOKIE_NAME}=`));

  return cookie?.split("=")[1] !== "false";
}

const AppLayout = () => (
  <SidebarProvider defaultOpen={readSidebarOpen()}>
    <AppSidebar />
    <SidebarInset className="md:border-border md:border">
      <AppHeader />
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
);

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});
