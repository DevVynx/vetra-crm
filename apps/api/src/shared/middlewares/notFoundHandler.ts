import { RequestHandler } from "express";

import { NotFoundError } from "@/shared/http/errors";

export const notFoundHandler: RequestHandler = () => {
  throw new NotFoundError("Route not found.");
};
