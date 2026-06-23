/* In Memory Event Bus 
* It is used to publish and subscribe to domain events in memory.
*/

import type { DomainEvent } from "../../domain/DomainEvent.js";
import type { DomainEventHandler, EventBus } from "./EventBus.js";

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  subscribe(eventName: string, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  publish(events: DomainEvent[]): void {
    for (const event of events) {
      const handlers = this.handlers.get(event.eventName) ?? [];

      for (const handler of handlers) {
        setImmediate(() => {
          void handler.handle(event).catch((error: unknown) => {
            console.error(
              `[EventBus] Handler failed for ${event.eventName}:`,
              error,
            );
          });
        });
      }
    }
  }
}
