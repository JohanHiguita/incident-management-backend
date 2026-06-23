import { describe, expect, it } from "vitest";
import { IncidentMetricsBuckets } from "../../../src/contexts/dashboard/domain/IncidentMetricsBuckets.js";

describe("IncidentMetricsBuckets", () => {
  it("defines open and resolved status groups for HU4", () => {
    expect(IncidentMetricsBuckets.openStatuses()).toEqual([
      "OPEN",
      "IN_PROGRESS",
    ]);
    expect(IncidentMetricsBuckets.resolvedStatuses()).toEqual([
      "RESOLVED",
      "CLOSED",
    ]);
  });
});
