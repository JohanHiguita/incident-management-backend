import { describe, expect, it } from "vitest";
import { Severity, SeverityLevel } from "../../../src/contexts/operational-events/domain/value-objects/Severity.js";

describe("Severity", () => {
  it("creates valid severity levels", () => {
    expect(Severity.create("critical").value).toBe(SeverityLevel.CRITICAL);
  });

  it("rejects invalid severity", () => {
    expect(() => Severity.create("URGENT")).toThrow(/Invalid severity level/);
  });

  it("identifies CRITICAL events", () => {
    expect(Severity.create("CRITICAL").isCritical()).toBe(true);
    expect(Severity.create("LOW").isCritical()).toBe(false);
  });
});
