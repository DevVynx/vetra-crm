import { dataTransferServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function exportDataController(
  _req: ValidatedRequest<typeof v.exportData>,
  res: Response
) {
  const { filename, content } = await dataTransferServices.exportData();

  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.send(content);
}
