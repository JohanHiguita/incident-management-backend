export class EventsNotFoundError extends Error {
    constructor() {
      super("One or more operational events were not found");
      this.name = "EventsNotFoundError";
    }
  }