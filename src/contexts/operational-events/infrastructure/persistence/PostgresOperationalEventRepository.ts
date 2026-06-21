import { OperationalEventRepository } from "../../domain/repositories/OperationalEventRepository.js";
import { postgresPool } from "./postgresPool.js";
import type { OperationalEvent } from "../../domain/OperationalEvent.js";
import type { TraceId } from "../../domain/value-objects/TraceId.js";

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
}
