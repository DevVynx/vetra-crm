import { NotFoundError } from "../../../shared/errors";

export class LeadNotFoundError extends NotFoundError {
  constructor() {
    super("Lead not found");
  }
}
