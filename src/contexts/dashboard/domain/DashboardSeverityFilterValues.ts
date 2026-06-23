export const DASHBOARD_SEVERITY_FILTER_VALUES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type DashboardSeverityFilterValue =
  (typeof DASHBOARD_SEVERITY_FILTER_VALUES)[number];

const DASHBOARD_SEVERITY_FILTER_SET = new Set<string>(
  DASHBOARD_SEVERITY_FILTER_VALUES,
);

export function isDashboardSeverityFilter(
  value: string,
): value is DashboardSeverityFilterValue {
  return DASHBOARD_SEVERITY_FILTER_SET.has(value);
}

export function formatDashboardSeverityFilterValues(): string {
  return DASHBOARD_SEVERITY_FILTER_VALUES.join(", ");
}
