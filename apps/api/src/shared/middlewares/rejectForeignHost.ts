import { envConfig } from "@vetra/env/server";
import { RequestHandler } from "express";

import { ForbiddenError } from "@/shared/http/errors";

const { API_PORT } = envConfig.get();

const ALLOWED_HOSTS = new Set([`127.0.0.1:${API_PORT}`, `localhost:${API_PORT}`]);

// Binding to 127.0.0.1 doesn't stop DNS rebinding; see API-OVERVIEW.md.
export const rejectForeignHost: RequestHandler = (req, _res, next) => {
  if (!ALLOWED_HOSTS.has(req.headers.host ?? "")) throw new ForbiddenError("Host not allowed.");

  next();
};
