import type { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import type { OperationalEventRepository } from "../../../operational-events/domain/repositories/OperationalEventRepository.js";
import { Incident } from "../../domain/Incident.js";
import { IncidentTitle } from "../../domain/value-objects/IncidentTitle.js";
import { IncidentDescription } from "../../domain/value-objects/IncidentDescription.js";
import { AffectedApplication } from "../../domain/value-objects/AffectedApplication.js";
import { IncidentSeverity } from "../../domain/value-objects/IncidentSeverity.js";
import { Assignee } from "../../domain/value-objects/Assignee.js";
import { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import type { CreateIncidentFromEventsRequest } from "./CreateIncidentFromEventsRequest.js";
import type { CreateIncidentFromEventsResponse } from "./CreateIncidentFromEventsResponse.js";
import { EventsNotFoundError } from "./EventsNotFoundError.js";

export class CreateIncidentFromEventsUseCase {
  constructor(
    private readonly incidentRepository: IncidentRepository,
    private readonly operationalEventRepository: OperationalEventRepository,
  ) {}

  async execute(
    request: CreateIncidentFromEventsRequest,
  ): Promise<CreateIncidentFromEventsResponse> {
    const linkedEventIds = request.eventIds.map((eventId) =>
      UniqueEntityId.fromString(eventId),
    );

    const events = await this.operationalEventRepository.findByIds(linkedEventIds);

    if (events.length !== linkedEventIds.length) {
      throw new EventsNotFoundError();
    }

    const affectedApplication = AffectedApplication.create(
      request.affectedApplication,
    );

    const hasMatchingEvent = events.some(
      (event) =>
        event.getSourceApplication().value === affectedApplication.value,
    );

    if (!hasMatchingEvent) {
      throw new Error(
        "Affected application does not match linked operational events",
      );
    }

    const incident = Incident.create({
      incidentTitle: IncidentTitle.create(request.title),
      incidentDescription: IncidentDescription.create(request.description),
      severity: IncidentSeverity.create(request.severity),
      assignee: Assignee.create(request.assignee),
      affectedApplication,
      linkedEventIds,
    });

    await this.incidentRepository.save(incident);

    return {
      id: incident.getId().value,
      title: incident.getIncidentTitle().value,
      status: incident.getIncidentStatus().value,
      affectedApplication: incident.getAffectedApplication().value,
      linkedEventIds: incident.getLinkedEventIds().map((eventId) => eventId.value),
    };
  }
}
