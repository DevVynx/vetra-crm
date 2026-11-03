import { NotFoundError } from "../../../shared/errors";

export class LeadNoteNotFoundError extends NotFoundError {
  constructor() {
    super("Lead note not found");
  }
}
