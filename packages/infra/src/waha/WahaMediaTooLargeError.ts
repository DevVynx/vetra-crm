export class WahaMediaTooLargeError extends Error {
  constructor() {
    super("The media is larger than the limit");
    this.name = "WahaMediaTooLargeError";
  }
}
