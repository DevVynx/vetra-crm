import { ConflictError } from "../../../shared/errors";

export class LeadNoteAlreadyExistsError extends ConflictError {
  constructor() {
    super("The lead note already exists");
  }
}
