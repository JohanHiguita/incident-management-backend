/**
 * DomainEvent is a contract for all domain events.
 * It is used to identify the event and the date it occurred.
 */

export interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventName: string;
}
