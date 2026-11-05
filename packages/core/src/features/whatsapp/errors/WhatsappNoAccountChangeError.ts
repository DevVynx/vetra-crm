import { ConflictError } from "../../../shared/errors";

export class WhatsappNoAccountChangeError extends ConflictError {
  constructor() {
    super("There is no WhatsApp account change to resolve");
  }
}
