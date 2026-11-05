import { ConflictError } from "../../../shared/errors";

export class WhatsappNotAwaitingQrError extends ConflictError {
  constructor() {
    super("The WhatsApp session is not waiting for a QR Code");
  }
}
