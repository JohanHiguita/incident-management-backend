import type { IncidentStatusValue } from "../../../shared/domain/IncidentStatusValues.js";

export class IncidentMetricsBuckets {
  static openStatuses(): IncidentStatusValue[] {
    return ["OPEN", "IN_PROGRESS"];
  }

  static resolvedStatuses(): IncidentStatusValue[] {
    return ["RESOLVED", "CLOSED"];
  }
}
