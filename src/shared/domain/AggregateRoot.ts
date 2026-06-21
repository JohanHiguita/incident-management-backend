/**
 * AggregateRoot is a base class for all aggregate roots.
 * It is used to create aggregate roots.
 */

import type { DomainEvent } from "./DomainEvent.js";
import { UniqueEntityId } from "./UniqueEntityId.js";

export abstract class AggregateRoot {
  private readonly _id: UniqueEntityId;
  private _domainEvents: DomainEvent[] = [];

  protected constructor(id: UniqueEntityId) {
    this._id = id;
  }

  getId(): UniqueEntityId {
    return this._id;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}