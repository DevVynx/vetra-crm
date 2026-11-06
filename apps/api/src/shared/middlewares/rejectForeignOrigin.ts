import { envConfig } from "@vetra/env/server";
import { RequestHandler } from "express";

import { ForbiddenError } from "@/shared/http/errors";

const THIS_COMPUTER = ["localhost", "127.0.0.1"];

// The app's own origin, in the two ways this computer is written: someone who typed the address
// with the IP is still at home, and is not a foreign site.
function ownOrigins(frontendUrl: string): Set<string> {
  const url = new URL(frontendUrl);
  const origins = new Set([url.origin]);

  if (THIS_COMPUTER.includes(url.hostname)) {
    for (const hostname of THIS_COMPUTER) {
      origins.add(`${url.protocol}//${hostname}${url.port ? `:${url.port}` : ""}`);
    }
  }

  return origins;
}

const ALLOWED_ORIGINS = ownOrigins(envConfig.get().FRONTEND_URL);

const METHODS_WITHOUT_EFFECTS = new Set(["GET", "HEAD", "OPTIONS"]);

// CORS only hides the response: a body-less POST from any site still runs. See API-OVERVIEW.md.
export const rejectForeignOrigin: RequestHandler = (req, _res, next) => {
  const { origin } = req.headers;
  const isForeign = origin !== undefined && !ALLOWED_ORIGINS.has(origin);

  if (isForeign && !METHODS_WITHOUT_EFFECTS.has(req.method)) {
    throw new ForbiddenError("Origin not allowed.");
  }

  next();
};
