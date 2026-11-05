export class WahaUnavailableError extends Error {
  constructor() {
    super("WAHA is unavailable or answered unexpectedly");
    this.name = new.target.name;
  }
}
