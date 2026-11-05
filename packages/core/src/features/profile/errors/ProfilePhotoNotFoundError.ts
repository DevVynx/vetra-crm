import { NotFoundError } from "../../../shared/errors";

export class ProfilePhotoNotFoundError extends NotFoundError {
  constructor() {
    super("Profile photo not found");
  }
}
