import { NotFoundError } from "../../../shared/errors";

export class NextActionNotFoundError extends NotFoundError {
  constructor() {
    super("Next action not found");
  }
}
