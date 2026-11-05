import { NotFoundError } from "../../../shared/errors";

export class WhatsappMediaUnavailableError extends NotFoundError {
  constructor() {
    super("The media of this message is not available");
  }
}
