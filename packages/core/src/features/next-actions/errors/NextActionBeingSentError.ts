import { ConflictError } from "../../../shared/errors";

export class NextActionBeingSentError extends ConflictError {
  constructor() {
    super("The next action is already being sent");
  }
}
