import { profileServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

const A_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

export async function getProfilePhotoController(
  _req: ValidatedRequest<typeof v.getPhoto>,
  res: Response
) {
  const { content } = await profileServices.readProfilePhoto();

  res.set({
    "Content-Type": "image/webp",
    "X-Content-Type-Options": "nosniff",
    // The web app is another origin. The address carries the photo's version, so it can be kept.
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Cache-Control": `private, max-age=${A_YEAR_IN_SECONDS}, immutable`,
  });
  res.send(content);
}
