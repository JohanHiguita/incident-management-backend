/* Event Bus 
* It is used to publish and subscribe to domain events.
*/

import type { DomainEvent } from "../../domain/DomainEvent.js";

export interface DomainEventHandler {
  handle(event: DomainEvent): Promise<void>;
}

export interface EventBus {
  subscribe(eventName: string, handler: DomainEventHandler): void;
  publish(events: DomainEvent[]): void;
}
