/* Use case for registering an operational event */

import type { OperationalEventRepository } from "../../domain/repositories/OperationalEventRepository.js";
import { OperationalEvent } from "../../domain/OperationalEvent.js";
import { SourceApplication } from "../../domain/value-objects/SourceApplication.js";
import { EventType } from "../../domain/value-objects/EventType.js";
import { EventDescription } from "../../domain/value-objects/EventDescription.js";
import { Severity } from "../../domain/value-objects/Severity.js";
import { OccurredAt } from "../../domain/value-objects/OccurredAt.js";
import { TraceId } from "../../domain/value-objects/TraceId.js";
import type { RegisterOperationalEventRequest } from "./RegisterOperationalEventRequest.js";
import type { RegisterOperationalEventResponse } from "./RegisterOperationalEventResponse.js";
import { DuplicateTraceIdError } from "./DuplicateTraceIdError.js";
import type { EventBus } from "../../../../shared/infrastructure/events/EventBus.js";

export class RegisterOperationalEventUseCase {

    constructor (
        private readonly repository: OperationalEventRepository,
        private readonly eventBus: EventBus,
    ){}

    async execute(request: RegisterOperationalEventRequest): Promise<RegisterOperationalEventResponse> {
        const sourceApplication = SourceApplication.create(request.sourceApplication);
        const eventType = EventType.create(request.eventType);
        const eventDescription = EventDescription.create(request.eventDescription);
        const severity = Severity.create(request.severity);
        const occurredAt = OccurredAt.create(request.occurredAt);
        const traceId = TraceId.create(request.traceId);

        if (await this.repository.existsByTraceId(traceId)) {
            throw new DuplicateTraceIdError(traceId.value);
        }

        const operationalEvent = OperationalEvent.create({
            sourceApplication,
            eventType,
            eventDescription,
            severity,
            occurredAt,
            traceId,
        });

        await this.repository.save(operationalEvent);

        // Publish the operational event to the event bus
        this.eventBus.publish(operationalEvent.pullDomainEvents());

        return {
            id: operationalEvent.getId().value,
            traceId: operationalEvent.getTraceId().value,
        };
        
    }

}