export class ReleasesUnavailableError extends Error {
  constructor() {
    super("The list of published releases could not be read");
    this.name = new.target.name;
  }
}
