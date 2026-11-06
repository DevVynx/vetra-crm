import { InvariantViolationError } from "../../../shared/errors";

export class InvalidImportFileError extends InvariantViolationError {
  constructor() {
    super("The file is not a Vetra export or a leads CSV");
  }
}
