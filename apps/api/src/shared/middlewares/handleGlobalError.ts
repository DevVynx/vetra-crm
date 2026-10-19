import { ErrorRequestHandler } from "express";

import { mapDomainErrorToHttp } from "@/shared/errors/mapDomainErrorToHttp";
import { HttpError } from "@/shared/http/errors";

export const handleGlobalError: ErrorRequestHandler = (error, _req, res, _next) => {
  const httpError = error instanceof HttpError ? error : mapDomainErrorToHttp(error);

  if (httpError) {
    return res.status(httpError.status).json({
      error: httpError.name,
      message: httpError.message,
      ...(httpError.issues ? { issues: httpError.issues } : {}),
    });
  }

  console.error(error);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Internal server error.",
  });
};
