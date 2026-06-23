import { CreateAlertOnCriticalEventHandler } from "../contexts/alerts/application/create-alert-on-critical-event/CreateAlertOnCriticalEventHandler.js";
import { PostgresAlertRepository } from "../contexts/alerts/infrastructure/persistence/PostgresAlertRepository.js";
import { OperationalEventRegistered } from "../contexts/operational-events/domain/events/OperationalEventRegistered.js";
import { InMemoryEventBus } from "../shared/infrastructure/events/InMemoryEventBus.js";

export const eventBus = new InMemoryEventBus();

export function registerEventHandlers(): void {
  const alertRepository = new PostgresAlertRepository();
  const createAlertHandler = new CreateAlertOnCriticalEventHandler(alertRepository);

  eventBus.subscribe(
    OperationalEventRegistered.EVENT_NAME,
    createAlertHandler,
  );
}
