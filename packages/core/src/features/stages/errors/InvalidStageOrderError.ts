import { InvariantViolationError } from "../../../shared/errors";

export class InvalidStageOrderError extends InvariantViolationError {
  constructor() {
    super("The new order must list every middle and archive stage exactly once");
  }
}
