import { ConflictError } from "../../../shared/errors";

export class LeadIsCustomerError extends ConflictError {
  constructor() {
    super("The lead is already a customer");
  }
}
