import { NotFoundError } from "../../../shared/errors";

export class WhatsappConversationNotFoundError extends NotFoundError {
  constructor() {
    super("WhatsApp conversation not found");
  }
}
