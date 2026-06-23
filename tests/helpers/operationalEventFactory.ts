import { OperationalEvent } from "../../src/contexts/operational-events/domain/OperationalEvent.js";
import { EventDescription } from "../../src/contexts/operational-events/domain/value-objects/EventDescription.js";
import { EventType } from "../../src/contexts/operational-events/domain/value-objects/EventType.js";
import { OccurredAt } from "../../src/contexts/operational-events/domain/value-objects/OccurredAt.js";
import { Severity } from "../../src/contexts/operational-events/domain/value-objects/Severity.js";
import { SourceApplication } from "../../src/contexts/operational-events/domain/value-objects/SourceApplication.js";
import { TraceId } from "../../src/contexts/operational-events/domain/value-objects/TraceId.js";
import { UniqueEntityId } from "../../src/shared/domain/UniqueEntityId.js";

const PAST_DATE = "2026-06-01T10:00:00.000Z";

export function buildOperationalEvent(
  overrides?: Partial<{
    id: string;
    sourceApplication: string;
    severity: string;
    traceId: string;
  }>,
): OperationalEvent {
  const id = UniqueEntityId.fromString(
    overrides?.id ?? "11111111-1111-1111-1111-111111111111",
  );

  return OperationalEvent.reconstitute(id, {
    sourceApplication: SourceApplication.create(
      overrides?.sourceApplication ?? "payments-api",
    ),
    eventType: EventType.create("PAYMENT_FAILED"),
    eventDescription: EventDescription.create("Test event description"),
    severity: Severity.create(overrides?.severity ?? "HIGH"),
    occurredAt: OccurredAt.create(PAST_DATE),
    traceId: TraceId.create(overrides?.traceId ?? `trace-${id.value}`),
  });
}

export function buildOperationalEventCreateProps(severity = "MEDIUM") {
  return {
    sourceApplication: SourceApplication.create("payments-api"),
    eventType: EventType.create("PAYMENT_FAILED"),
    eventDescription: EventDescription.create("Checkout failure"),
    severity: Severity.create(severity),
    occurredAt: OccurredAt.create(PAST_DATE),
    traceId: TraceId.create(`trace-create-${crypto.randomUUID()}`),
  };
}
