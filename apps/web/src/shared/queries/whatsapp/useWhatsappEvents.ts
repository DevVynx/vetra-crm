import { useQueryClient } from "@tanstack/react-query";
import { whatsappRoutes } from "@vetra/routes";
import { useEffect } from "react";

import api from "@/shared/lib/axios/api";

import { whatsappQueryKeys } from "./keys";

const RECONNECT_DELAY_MS = 3_000;

// The event only says that something changed; the data still comes from the normal queries.
export function useWhatsappEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refetch = () => void queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all });
    let events: EventSource;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      events = new EventSource(api.getUri({ url: whatsappRoutes.events }));
      events.onmessage = refetch;
      // Also covers what changed while the connection was down, when no signal could arrive.
      events.onopen = refetch;
      // The browser retries a dropped connection by itself, but gives up for good after any error
      // response, leaving only the slow safety refetch.
      events.onerror = () => {
        if (events.readyState === EventSource.CLOSED) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      events.close();
    };
  }, [queryClient]);
}
