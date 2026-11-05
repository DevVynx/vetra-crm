import { ConflictError } from "../../../shared/errors";

export class WhatsappStillConnectedError extends ConflictError {
  constructor() {
    super("Disconnect WhatsApp before deleting its conversations");
  }
}
