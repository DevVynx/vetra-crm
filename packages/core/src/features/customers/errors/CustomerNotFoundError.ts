import { NotFoundError } from "../../../shared/errors";

export class CustomerNotFoundError extends NotFoundError {
  constructor() {
    super("Customer not found");
  }
}
