import express, { type RequestHandler } from "express";

import { UnprocessableEntityError } from "@/shared/http/errors";

// A file arrives as the bytes of the request. One over the limit is a clear 422, not a 500.
export function rawFileBody(maxBytes: number): RequestHandler {
  const readBytes = express.raw({ type: () => true, limit: maxBytes });

  return (req, res, next) =>
    readBytes(req, res, (error?: unknown) => {
      const isTooLarge = (error as { type?: string } | undefined)?.type === "entity.too.large";

      next(isTooLarge ? new UnprocessableEntityError("The file is larger than the limit.") : error);
    });
}
