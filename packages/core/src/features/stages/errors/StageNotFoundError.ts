import { NotFoundError } from "../../../shared/errors";

export class StageNotFoundError extends NotFoundError {
  constructor() {
    super("Stage not found");
  }
}
