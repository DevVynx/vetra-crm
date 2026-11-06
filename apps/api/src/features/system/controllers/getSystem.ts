import { type SystemResponse, systemResponseSchema } from "@vetra/contracts";
import type { Request, Response } from "express";

// What the prospecting pipeline asks first, to know that Vetra is there and which contract it speaks.
export function getSystemController(_req: Request, res: Response<SystemResponse>) {
  res.json(systemResponseSchema.parse({ name: "vetra", apiVersion: 1 }));
}
