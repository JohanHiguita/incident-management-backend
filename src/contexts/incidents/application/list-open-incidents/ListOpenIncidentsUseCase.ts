import type { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import type { ListOpenIncidentsResponse } from "./ListOpenIncidentsResponse.js";

export class ListOpenIncidentsUseCase {
  constructor(private readonly repository: IncidentRepository) {}

  async execute(): Promise<ListOpenIncidentsResponse> {
    const incidents = await this.repository.findOpen();

    return incidents.map((incident) => ({
      id: incident.getId().value,
      affectedApplication: incident.getAffectedApplication().value,
      severity: incident.getSeverity().value,
      status: incident.getIncidentStatus().value,
      createdAt: incident.getCreatedAt().toISOString(),
    }));
  }
}
