export class IncidentNotFoundError extends Error {
    constructor(incidentId: string) {
      super(`Incident with id ${incidentId} was not found`);
      this.name = "IncidentNotFoundError";
    }
  }