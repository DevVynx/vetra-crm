import { ServiceUnavailableError } from "../../../shared/errors";

export class WhatsappUnavailableError extends ServiceUnavailableError {
  constructor() {
    super("The WhatsApp service is unavailable");
  }
}
