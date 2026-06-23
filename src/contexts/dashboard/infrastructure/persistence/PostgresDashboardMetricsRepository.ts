import { postgresPool } from "../../../../shared/infrastructure/persistence/postgresPool.js";
import type { DashboardFilters } from "../../domain/DashboardFilters.js";
import type {
  DashboardMetrics,
  MetricResult,
} from "../../domain/DashboardMetrics.js";
import { IncidentMetricsBuckets } from "../../domain/IncidentMetricsBuckets.js";
import type { DashboardMetricsRepository } from "../../domain/repositories/DashboardMetricsRepository.js";

interface SqlFragment {
  clause: string;
  values: unknown[];
}

export class PostgresDashboardMetricsRepository implements DashboardMetricsRepository {
  async getMetrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    const results = await Promise.allSettled([
      this.countIncidents(filters, IncidentMetricsBuckets.openStatuses()),
      this.countIncidents(filters, IncidentMetricsBuckets.resolvedStatuses()),
      this.countEventsGrouped(filters, "source_application"),
      this.countEventsGrouped(filters, "severity"),
      this.countAlerts(filters),
    ]);

    return {
      openIncidents: toMetricResult(results[0]),
      resolvedIncidents: toMetricResult(results[1]),
      eventsByApplication: toMetricResult(results[2]),
      eventsBySeverity: toMetricResult(results[3]),
      alertsGenerated: toMetricResult(results[4]),
    };
  }

  private async countIncidents(
    filters: DashboardFilters,
    statuses: string[],
  ): Promise<number> {
    const { clause, values } = buildIncidentWhere(filters, statuses);

    const result = await postgresPool.query(
      `SELECT COUNT(*)::int AS count FROM incidents WHERE ${clause}`,
      values,
    );

    return result.rows[0]?.count ?? 0;
  }

  private async countEventsGrouped(
    filters: DashboardFilters,
    groupColumn: "source_application" | "severity",
  ): Promise<Array<{ label: string; count: number }>> {
    const { clause, values } = buildEventWhere(filters);

    const result = await postgresPool.query(
      `
      SELECT ${groupColumn} AS label, COUNT(*)::int AS count
      FROM operational_events
      WHERE ${clause}
      GROUP BY ${groupColumn}
      ORDER BY count DESC, label ASC
      `,
      values,
    );

    return result.rows.map((row) => ({
      label: row.label,
      count: row.count,
    }));
  }

  private async countAlerts(filters: DashboardFilters): Promise<number> {
    const { clause, values } = buildAlertWhere(filters);

    const result = await postgresPool.query(
      `SELECT COUNT(*)::int AS count FROM alerts WHERE ${clause}`,
      values,
    );

    return result.rows[0]?.count ?? 0;
  }
}

/* Helper function to convert the result to a metric result */
function toMetricResult<T>(result: PromiseSettledResult<T>): MetricResult<T> {
  if (result.status === "fulfilled") {
    return { status: "ok", value: result.value };
  }

  const reason = result.reason;

  return {
    status: "error",
    error: reason instanceof Error ? reason.message : "Unknown error",
  };
}

/* Helper function to build the incident where clause */
function buildIncidentWhere(
  filters: DashboardFilters,
  statuses: string[],
): SqlFragment {
  const values: unknown[] = [statuses];
  let clause = `status = ANY($${values.length})`;

  if (filters.status) {
    values.push(filters.status);
    clause += ` AND status = $${values.length}`;
  }

  if (filters.application) {
    values.push(filters.application);
    clause += ` AND affected_application = $${values.length}`;
  }

  if (filters.severity) {
    values.push(filters.severity);
    clause += ` AND severity = $${values.length}`;
  }

  if (filters.fromDate) {
    values.push(filters.fromDate);
    clause += ` AND created_at >= $${values.length}`;
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    clause += ` AND created_at <= $${values.length}`;
  }

  return { clause, values };
}

/* Helper function to build the event where clause */
function buildEventWhere(filters: DashboardFilters): SqlFragment {
  const values: unknown[] = [];
  const conditions = ["TRUE"];

  if (filters.application) {
    values.push(filters.application);
    conditions.push(`source_application = $${values.length}`);
  }

  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`severity = $${values.length}`);
  }

  if (filters.fromDate) {
    values.push(filters.fromDate);
    conditions.push(`occurred_at >= $${values.length}`);
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    conditions.push(`occurred_at <= $${values.length}`);
  }

  return { clause: conditions.join(" AND "), values };
}

/* Helper function to build the alert where clause */
function buildAlertWhere(filters: DashboardFilters): SqlFragment {
  const values: unknown[] = [];
  const conditions = ["TRUE"];

  if (filters.application) {
    values.push(filters.application);
    conditions.push(`affected_application = $${values.length}`);
  }

  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`severity = $${values.length}`);
  }

  if (filters.fromDate) {
    values.push(filters.fromDate);
    conditions.push(`generated_at >= $${values.length}`);
  }

  if (filters.toDate) {
    values.push(filters.toDate);
    conditions.push(`generated_at <= $${values.length}`);
  }

  return { clause: conditions.join(" AND "), values };
}
