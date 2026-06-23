/* Dashboard Metrics Domain Entity */

export interface CountByLabel {
  label: string;
  count: number;
}

export type MetricResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; error: string };

export interface DashboardMetrics {
  openIncidents: MetricResult<number>;
  resolvedIncidents: MetricResult<number>;
  eventsByApplication: MetricResult<CountByLabel[]>;
  eventsBySeverity: MetricResult<CountByLabel[]>;
  alertsGenerated: MetricResult<number>;
}
