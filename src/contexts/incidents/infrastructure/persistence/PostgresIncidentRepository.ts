import { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import { IncidentTitle } from "../../domain/value-objects/IncidentTitle.js";
import { IncidentDescription } from "../../domain/value-objects/IncidentDescription.js";
import { IncidentStatus } from "../../domain/value-objects/IncidentStatus.js";
import { Assignee } from "../../domain/value-objects/Assignee.js";
import { AffectedApplication } from "../../domain/value-objects/AffectedApplication.js";
import { IncidentSeverity } from "../../domain/value-objects/IncidentSeverity.js";
import { postgresPool } from "../../../../shared/infrastructure/persistence/postgresPool.js";
import { Incident } from "../../domain/Incident.js";
import { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import type { IncidentStatusValue } from "../../../../shared/domain/IncidentStatusValues.js";

const OPEN_STATUSES: IncidentStatusValue[] = ["OPEN", "IN_PROGRESS"];

export class PostgresIncidentRepository implements IncidentRepository {
  async save(incident: Incident): Promise<void> {
    const client = await postgresPool.connect();
    const incidentId = incident.getId().value;

    try {
      await client.query("BEGIN");

      await client.query(
        `
        INSERT INTO incidents
          (id, title, description, affected_application, severity, status, assignee, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status
        `,
        [
          incidentId,
          incident.getIncidentTitle().value,
          incident.getIncidentDescription().value,
          incident.getAffectedApplication().value,
          incident.getSeverity().value,
          incident.getIncidentStatus().value,
          incident.getAssignee().value,
          incident.getCreatedAt(),
        ],
      );

      await client.query(`DELETE FROM incident_events WHERE incident_id = $1`, [
        incidentId,
      ]);

      for (const eventId of incident.getLinkedEventIds()) {
        await client.query(
          `INSERT INTO incident_events (incident_id, event_id) VALUES ($1, $2)`,
          [incidentId, eventId.value],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: UniqueEntityId): Promise<Incident | null> {
    const incidentResult = await postgresPool.query(
      `
      SELECT id, title, description, affected_application, severity, status, assignee, created_at
      FROM incidents
      WHERE id = $1
      `,
      [id.value],
    );

    if ((incidentResult.rowCount ?? 0) === 0) {
      return null;
    }

    const row = incidentResult.rows[0];

    const eventsResult = await postgresPool.query(
      `SELECT event_id FROM incident_events WHERE incident_id = $1`,
      [id.value],
    );

    const linkedEventIds = eventsResult.rows.map((eventRow) =>
      UniqueEntityId.fromString(eventRow.event_id),
    );

    return Incident.reconstitute(UniqueEntityId.fromString(row.id), {
      incidentTitle: IncidentTitle.create(row.title),
      incidentDescription: IncidentDescription.create(row.description),
      incidentStatus: IncidentStatus.create(row.status),
      severity: IncidentSeverity.create(row.severity),
      assignee: Assignee.create(row.assignee),
      affectedApplication: AffectedApplication.create(row.affected_application),
      createdAt: row.created_at as Date,
      linkedEventIds,
    });
  }

  async findOpen(): Promise<Incident[]> {
    const incidentResult = await postgresPool.query(
      `
      SELECT id, title, description, affected_application, severity, status, assignee, created_at
      FROM incidents
      WHERE status = ANY($1)
      ORDER BY created_at DESC
      `,
      [OPEN_STATUSES],
    );

    if ((incidentResult.rowCount ?? 0) === 0) {
      return [];
    }

    const incidentIds = incidentResult.rows.map((row) => row.id as string);

    const eventsResult = await postgresPool.query(
      `
      SELECT incident_id, event_id
      FROM incident_events
      WHERE incident_id = ANY($1)
      `,
      [incidentIds],
    );

    const linkedEventsByIncident = new Map<string, UniqueEntityId[]>();

    for (const eventRow of eventsResult.rows) {
      const incidentId = eventRow.incident_id as string;
      const linkedEventIds = linkedEventsByIncident.get(incidentId) ?? [];
      linkedEventIds.push(UniqueEntityId.fromString(eventRow.event_id));
      linkedEventsByIncident.set(incidentId, linkedEventIds);
    }

    return incidentResult.rows.map((row) =>
      Incident.reconstitute(UniqueEntityId.fromString(row.id), {
        incidentTitle: IncidentTitle.create(row.title),
        incidentDescription: IncidentDescription.create(row.description),
        incidentStatus: IncidentStatus.create(row.status),
        severity: IncidentSeverity.create(row.severity),
        assignee: Assignee.create(row.assignee),
        affectedApplication: AffectedApplication.create(
          row.affected_application,
        ),
        createdAt: row.created_at as Date,
        linkedEventIds: linkedEventsByIncident.get(row.id) ?? [],
      }),
    );
  }
}
