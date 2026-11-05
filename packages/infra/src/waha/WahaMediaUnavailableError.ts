// The message has no file to give: it was never downloaded, or WhatsApp doesn't serve it anymore.
export class WahaMediaUnavailableError extends Error {
  constructor() {
    super("The media is not available");
    this.name = "WahaMediaUnavailableError";
  }
}
