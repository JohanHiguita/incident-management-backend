import { describe, expect, it } from "vitest";
import { DashboardFilters } from "../../../src/contexts/dashboard/domain/DashboardFilters.js";

describe("DashboardFilters", () => {
  it("accepts valid optional filters", () => {
    const filters = DashboardFilters.create({
      application: "payments-api",
      severity: "critical",
      status: "open",
      fromDate: "2026-06-01T00:00:00.000Z",
      toDate: "2026-06-10T00:00:00.000Z",
    });

    expect(filters.application).toBe("payments-api");
    expect(filters.severity).toBe("CRITICAL");
    expect(filters.status).toBe("OPEN");
  });

  it("rejects unknown application", () => {
    expect(() =>
      DashboardFilters.create({ application: "unknown-app" }),
    ).toThrow(/Invalid application filter/);
  });

  it("rejects fromDate after toDate", () => {
    expect(() =>
      DashboardFilters.create({
        fromDate: "2026-06-10T00:00:00.000Z",
        toDate: "2026-06-01T00:00:00.000Z",
      }),
    ).toThrow(/fromDate cannot be after toDate/);
  });
});
