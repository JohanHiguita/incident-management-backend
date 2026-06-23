import { OperationalEventRepository } from "../../domain/repositories/OperationalEventRepository.js";
import { postgresPool } from "../../../../shared/infrastructure/persistence/postgresPool.js";
import { OperationalEvent } from "../../domain/OperationalEvent.js";
import { TraceId } from "../../domain/value-objects/TraceId.js";
import { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import { EventType } from "../../domain/value-objects/EventType.js";
import { SourceApplication } from "../../domain/value-objects/SourceApplication.js";
import { EventDescription } from "../../domain/value-objects/EventDescription.js";
import { Severity } from "../../domain/value-objects/Severity.js";
import { OccurredAt } from "../../domain/value-objects/OccurredAt.js";

export class PostgresOperationalEventRepository implements OperationalEventRepository {
  async save(operationalEvent: OperationalEvent): Promise<void> {
    const query = `
      INSERT INTO operational_events (id, source_application, event_type, event_description, severity, occurred_at, trace_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await postgresPool.query(query, [
      operationalEvent.getId().value,
      operationalEvent.getSourceApplication().value,
      operationalEvent.getEventType().value,
      operationalEvent.getEventDescription().value,
      operationalEvent.getSeverity().value,
      operationalEvent.getOccurredAt().value,
      operationalEvent.getTraceId().value,
    ]);
  }

  async existsByTraceId(traceId: TraceId): Promise<boolean> {
    const query = `
      SELECT 1
      FROM operational_events
      WHERE trace_id = $1
      LIMIT 1
    `;

    const result = await postgresPool.query(query, [traceId.value]);

    return (result.rowCount ?? 0) > 0;
  }

  async findByIds(ids: UniqueEntityId[]): Promise<OperationalEvent[]> {
    if (ids.length === 0) {
      return [];
    }

    const query = `
      SELECT id, source_application, event_type, event_description, severity, occurred_at, trace_id FROM operational_events
      WHERE id = ANY($1::uuid[])
    `;

    const result = await postgresPool.query(query, [ids.map((id) => id.value)]);
    return result.rows.map((row) =>
      OperationalEvent.reconstitute(UniqueEntityId.fromString(row.id), {
        sourceApplication: SourceApplication.create(row.source_application),
        eventType: EventType.create(row.event_type),
        eventDescription: EventDescription.create(row.event_description),
        severity: Severity.create(row.severity),
        occurredAt: OccurredAt.create((row.occurred_at as Date).toISOString()),
        traceId: TraceId.create(row.trace_id),
      }),
    );
  }
}
