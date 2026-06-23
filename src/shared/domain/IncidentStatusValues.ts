export const INCIDENT_STATUS_VALUES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export type IncidentStatusValue = (typeof INCIDENT_STATUS_VALUES)[number];

const INCIDENT_STATUS_SET = new Set<string>(INCIDENT_STATUS_VALUES);

export function isIncidentStatus(value: string): value is IncidentStatusValue {
  return INCIDENT_STATUS_SET.has(value);
}

export function formatIncidentStatusValues(): string {
  return INCIDENT_STATUS_VALUES.join(", ");
}
