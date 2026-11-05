import { ConflictError } from "../../../shared/errors";

export class WhatsappNotConnectedError extends ConflictError {
  constructor() {
    super("WhatsApp is not connected");
  }
}
