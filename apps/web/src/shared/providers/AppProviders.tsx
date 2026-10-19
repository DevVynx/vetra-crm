import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

import { Toaster } from "@/shared/components/ui/sonner";
import { queryClient } from "@/shared/lib/tanstack/queryClient";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" richColors />
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <TanStackRouterDevtools />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
