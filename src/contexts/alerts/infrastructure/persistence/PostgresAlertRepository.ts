import { postgresPool } from "../../../../shared/infrastructure/persistence/postgresPool.js";
import type { Alert } from "../../domain/Alert.js";
import type { AlertRepository } from "../../domain/repositories/AlertRepository.js";

export class PostgresAlertRepository implements AlertRepository {
  async save(alert: Alert): Promise<void> {
    await postgresPool.query(
      `
      INSERT INTO alerts
        (id, source_event_id, affected_application, severity, generated_at, processing_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        alert.getId().value,
        alert.getSourceEventId().value,
        alert.getAffectedApplication().value,
        alert.getSeverity().value,
        alert.getGeneratedAt(),
        alert.getProcessingStatus().value,
      ],
    );
  }
}
