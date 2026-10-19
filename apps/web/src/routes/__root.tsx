import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ThemeToggle } from "@/shared/components/ThemeToggle";
import AppProviders from "@/shared/providers/AppProviders";

const RootLayout = () => (
  <AppProviders>
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <ThemeToggle />
    </div>
    <Outlet />
  </AppProviders>
);

export const Route = createRootRoute({ component: RootLayout });
