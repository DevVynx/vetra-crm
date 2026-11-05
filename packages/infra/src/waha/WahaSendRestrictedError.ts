export class WahaSendRestrictedError extends Error {
  constructor() {
    super("WhatsApp is restricting messages to new contacts");
    this.name = new.target.name;
  }
}
