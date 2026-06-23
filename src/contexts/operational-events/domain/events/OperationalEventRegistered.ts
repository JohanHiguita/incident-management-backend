import type { DomainEvent } from "../../../../shared/domain/DomainEvent.js";

export class OperationalEventRegistered implements DomainEvent {
  static readonly EVENT_NAME = "operational-events.operational-event.registered";

  readonly eventName = OperationalEventRegistered.EVENT_NAME;
  readonly occurredOn: Date;

  constructor(
    readonly eventId: string,
    readonly sourceApplication: string,
    readonly severity: string,
    readonly traceId: string,
    occurredAt: Date,
  ) {
    this.occurredOn = occurredAt;
  }
}
