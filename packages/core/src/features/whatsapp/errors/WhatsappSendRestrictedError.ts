import { RateLimitedError } from "../../../shared/errors";

export class WhatsappSendRestrictedError extends RateLimitedError {
  constructor() {
    super("WhatsApp is restricting messages to new contacts");
  }
}
