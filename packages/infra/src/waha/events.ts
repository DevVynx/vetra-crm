import { envConfig } from "@vetra/env/waha";
import { z } from "zod";

import { wahaMessageSchema } from "./messages";
import { WAHA_SESSION } from "./wahaFetch";

const MIN_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

const wahaEventSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("session.status"),
    payload: z.object({ status: z.string() }),
  }),
  z.object({
    event: z.literal("message.any"),
    payload: wahaMessageSchema,
  }),
  z.object({
    event: z.literal("message.ack"),
    payload: z.object({
      id: z.string(),
      fromMe: z.boolean(),
      ackName: z.string().nullish(),
    }),
  }),
  z.object({
    event: z.literal("message.edited"),
    payload: z.object({ editedMessageId: z.string().nullish(), body: z.string().nullish() }),
  }),
  z.object({
    event: z.literal("message.revoked"),
    payload: z.object({
      revokedMessageId: z.string().nullish(),
      after: z.object({ revokedMessageId: z.string().nullish() }).nullish(),
    }),
  }),
]);
export type WahaEvent = z.infer<typeof wahaEventSchema>;

type WahaEventHandlers = {
  onOpen: () => void;
  onEvent: (event: WahaEvent) => void;
};

let reconnectDelay = MIN_RECONNECT_DELAY_MS;

function parseEvent(data: unknown): WahaEvent | null {
  try {
    return wahaEventSchema.parse(JSON.parse(String(data)));
  } catch {
    return null;
  }
}

// The URL carries the API key, so it must never reach a log or an error message.
function buildEventsUrl(): string {
  const { WAHA_URL, WAHA_API_KEY } = envConfig.get();
  const url = new URL("/ws", WAHA_URL);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("x-api-key", WAHA_API_KEY);
  url.searchParams.set("session", WAHA_SESSION);
  for (const event of [
    "session.status",
    "message.any",
    "message.ack",
    "message.edited",
    "message.revoked",
  ]) {
    url.searchParams.append("events", event);
  }

  return url.toString();
}

export function subscribeToEvents(handlers: WahaEventHandlers): void {
  const socket = new WebSocket(buildEventsUrl());

  socket.addEventListener("open", () => {
    reconnectDelay = MIN_RECONNECT_DELAY_MS;
    handlers.onOpen();
  });

  socket.addEventListener("message", ({ data }) => {
    const event = parseEvent(data);
    if (event) handlers.onEvent(event);
  });

  socket.addEventListener("close", () => {
    const timer = setTimeout(() => subscribeToEvents(handlers), reconnectDelay);
    timer.unref();
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
  });

  // Every failed connection also fires "close", which is what schedules the next try.
  socket.addEventListener("error", () => undefined);
}
