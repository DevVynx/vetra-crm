import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { RouteError } from "./shared/components/layout/RouteError";

export const router = createRouter({ routeTree, defaultErrorComponent: RouteError });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    title?: string;
    parent?: { label: string; to: "/leads" | "/customers" };
  }
}
