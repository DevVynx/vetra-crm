import { useQueryClient } from "@tanstack/react-query";
import { whatsappRoutes } from "@vetra/routes";
import { useEffect } from "react";

import api from "@/shared/lib/axios/api";

import { whatsappQueryKeys } from "./keys";

// The event only says that something changed; the data still comes from the normal queries.
export function useWhatsappEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const events = new EventSource(api.getUri({ url: whatsappRoutes.events }));

    events.onmessage = () => {
      void queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all });
    };

    return () => events.close();
  }, [queryClient]);
}
