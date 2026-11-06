import { ConflictError } from "../../../shared/errors";

export class NextActionAlreadyExistsError extends ConflictError {
  constructor() {
    super("The next action already exists");
  }
}
