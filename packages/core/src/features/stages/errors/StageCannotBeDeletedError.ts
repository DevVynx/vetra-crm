import { ConflictError } from "../../../shared/errors";

type Reason = "entry" | "closing" | "lastMiddle" | "lastArchive";

const messages: Record<Reason, string> = {
  entry: "The entry stage cannot be deleted",
  closing: "The closing stage cannot be deleted",
  lastMiddle: "The last middle stage cannot be deleted",
  lastArchive: "The last archive stage cannot be deleted",
};

export class StageCannotBeDeletedError extends ConflictError {
  constructor(reason: Reason) {
    super(messages[reason]);
  }
}
