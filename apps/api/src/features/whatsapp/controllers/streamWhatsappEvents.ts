import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

// Without traffic, an idle connection can be dropped silently along the way.
const HEARTBEAT_INTERVAL_MS = 25_000;

// Only says that something changed: the web refetches with its normal queries, so no message
// text, name or number ever goes through here.
export function streamWhatsappEventsController(req: Request, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  const sendChange = () => res.write("data: changed\n\n");
  const heartbeat = setInterval(() => res.write(": ping\n\n"), HEARTBEAT_INTERVAL_MS);

  whatsappServices.addWhatsappChangeListener(sendChange);

  req.on("close", () => {
    clearInterval(heartbeat);
    whatsappServices.removeWhatsappChangeListener(sendChange);
  });
}
