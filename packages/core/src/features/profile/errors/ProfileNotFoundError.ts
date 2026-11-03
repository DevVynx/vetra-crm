import { NotFoundError } from "../../../shared/errors";

export class ProfileNotFoundError extends NotFoundError {
  constructor() {
    super("Profile not found");
  }
}
