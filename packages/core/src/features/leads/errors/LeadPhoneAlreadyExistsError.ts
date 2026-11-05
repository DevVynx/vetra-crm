import { ConflictError } from "../../../shared/errors";

export class LeadPhoneAlreadyExistsError extends ConflictError {
  constructor() {
    super("The phone already belongs to another lead or customer");
  }
}
