import { describe, expect, it } from "vitest";
import { IncidentStatus } from "../../../src/contexts/incidents/domain/value-objects/IncidentStatus.js";

describe("IncidentStatus", () => {
  it("allows valid transitions", () => {
    const open = IncidentStatus.create("OPEN");
    const inProgress = IncidentStatus.create("IN_PROGRESS");

    expect(open.canTransitionTo(inProgress)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    const open = IncidentStatus.create("OPEN");
    const closed = IncidentStatus.create("CLOSED");

    expect(open.canTransitionTo(closed)).toBe(false);
  });
});
