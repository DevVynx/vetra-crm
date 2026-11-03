import { NotFoundError } from "../../../shared/errors";

export class ProjectNotFoundError extends NotFoundError {
  constructor() {
    super("Project not found");
  }
}
