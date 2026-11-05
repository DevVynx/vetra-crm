import { envConfig } from "@vetra/env/server";
import { RequestHandler } from "express";

import { ForbiddenError } from "@/shared/http/errors";

const ALLOWED_ORIGIN = new URL(envConfig.get().FRONTEND_URL).origin;

const METHODS_WITHOUT_EFFECTS = new Set(["GET", "HEAD", "OPTIONS"]);

// CORS only hides the response: a body-less POST from any site still runs. See API-OVERVIEW.md.
export const rejectForeignOrigin: RequestHandler = (req, _res, next) => {
  const { origin } = req.headers;
  const isForeign = origin !== undefined && origin !== ALLOWED_ORIGIN;

  if (isForeign && !METHODS_WITHOUT_EFFECTS.has(req.method)) {
    throw new ForbiddenError("Origin not allowed.");
  }

  next();
};
