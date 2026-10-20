import { createRootRoute, Outlet } from "@tanstack/react-router";

import AppProviders from "@/shared/providers/AppProviders";

const RootLayout = () => (
  <AppProviders>
    <Outlet />
  </AppProviders>
);

export const Route = createRootRoute({ component: RootLayout });
