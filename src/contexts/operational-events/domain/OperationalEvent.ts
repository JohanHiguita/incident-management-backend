/* Operational Event Domain Entity 
Aggregate Root for the Operational Event
*/

import { AggregateRoot } from "../../../shared/domain/AggregateRoot.js";
import { UniqueEntityId } from "../../../shared/domain/UniqueEntityId.js";
import { SourceApplication } from "./value-objects/SourceApplication.js";
import { EventType } from "./value-objects/EventType.js";
import { EventDescription } from "./value-objects/EventDescription.js";
import { Severity } from "./value-objects/Severity.js";
import { OccurredAt } from "./value-objects/OccurredAt.js";
import { TraceId } from "./value-objects/TraceId.js";
import { OperationalEventRegistered } from "./events/OperationalEventRegistered.js";

interface CreateOperationalEventProps {
  sourceApplication: SourceApplication;
  eventType: EventType;
  eventDescription: EventDescription;
  severity: Severity;
  occurredAt: OccurredAt;
  traceId: TraceId;
}

export class OperationalEvent extends AggregateRoot {
  private readonly sourceApplication: SourceApplication;
  private readonly eventType: EventType;
  private readonly eventDescription: EventDescription;
  private readonly severity: Severity;
  private readonly occurredAt: OccurredAt;
  private readonly traceId: TraceId;

  private constructor(id: UniqueEntityId, props: CreateOperationalEventProps) {
    super(id);
    this.sourceApplication = props.sourceApplication;
    this.eventType = props.eventType;
    this.eventDescription = props.eventDescription;
    this.severity = props.severity;
    this.traceId = props.traceId;
    this.occurredAt = props.occurredAt;
  }

  static create(params: CreateOperationalEventProps): OperationalEvent {
    const id = UniqueEntityId.create();

    const event = new OperationalEvent(id, params);
    event.recordRegistered(); // Record the registered event

    return event;
  }

  static reconstitute(
    id: UniqueEntityId,
    props: CreateOperationalEventProps,
  ): OperationalEvent {
    return new OperationalEvent(id, props);
  }

  getSourceApplication(): SourceApplication {
    return this.sourceApplication;
  }

  getEventType(): EventType {
    return this.eventType;
  }

  getEventDescription(): EventDescription {
    return this.eventDescription;
  }

  getSeverity(): Severity {
    return this.severity;
  }

  getOccurredAt(): OccurredAt {
    return this.occurredAt;
  }

  getTraceId(): TraceId {
    return this.traceId;
  }

  private recordRegistered(): void {
    this.addDomainEvent(
      new OperationalEventRegistered(
        this.getId().value,
        this.sourceApplication.value,
        this.severity.value,
        this.traceId.value,
        this.occurredAt.value,
      ),
    );
  }
}
