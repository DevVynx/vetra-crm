// WAHA answered, but WhatsApp refused the action: too old to edit, not allowed, and so on.
export class WahaRequestRejectedError extends Error {
  constructor() {
    super("WhatsApp rejected the action");
    this.name = "WahaRequestRejectedError";
  }
}
