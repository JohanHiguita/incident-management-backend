import { OperationalEventRegistered } from "../../../operational-events/domain/events/OperationalEventRegistered.js";
import type { DomainEvent } from "../../../../shared/domain/DomainEvent.js";
import type { DomainEventHandler } from "../../../../shared/infrastructure/events/EventBus.js";
import { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import { Alert } from "../../domain/Alert.js";
import type { AlertRepository } from "../../domain/repositories/AlertRepository.js";
import { AffectedApplication } from "../../domain/value-objects/AffectedApplication.js";
import { AlertSeverity } from "../../domain/value-objects/AlertSeverity.js";

export class CreateAlertOnCriticalEventHandler implements DomainEventHandler {
  constructor(private readonly alertRepository: AlertRepository) {}

  async handle(event: DomainEvent): Promise<void> {
    if (!(event instanceof OperationalEventRegistered)) {
      return;
    }

    const severity = AlertSeverity.create(event.severity);

    if (!severity.isCritical()) {
      return;
    }

    const alert = Alert.createFromCriticalEvent({
      sourceEventId: UniqueEntityId.fromString(event.eventId),
      affectedApplication: AffectedApplication.create(event.sourceApplication),
      severity,
      generatedAt: event.occurredOn,
    });

    await this.alertRepository.save(alert);
  }
}
