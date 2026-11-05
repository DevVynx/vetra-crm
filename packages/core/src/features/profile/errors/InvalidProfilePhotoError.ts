import { InvariantViolationError } from "../../../shared/errors";

export class InvalidProfilePhotoError extends InvariantViolationError {
  constructor() {
    super("The photo must be a WebP image within the size limit");
  }
}
