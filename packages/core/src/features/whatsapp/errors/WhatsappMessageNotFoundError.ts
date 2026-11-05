import { NotFoundError } from "../../../shared/errors";

export class WhatsappMessageNotFoundError extends NotFoundError {
  constructor() {
    super("WhatsApp message not found");
  }
}
