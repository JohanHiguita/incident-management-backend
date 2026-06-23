import { describe, expect, it, vi } from "vitest";
import { GetDashboardMetricsUseCase } from "../../../src/contexts/dashboard/application/get-dashboard-metrics/GetDashboardMetricsUseCase.js";
import type { DashboardMetricsRepository } from "../../../src/contexts/dashboard/domain/repositories/DashboardMetricsRepository.js";

describe("GetDashboardMetricsUseCase", () => {
  it("returns metrics from repository with validated filters", async () => {
    const metrics = {
      openIncidents: { status: "ok" as const, value: 2 },
      resolvedIncidents: { status: "ok" as const, value: 1 },
      eventsByApplication: { status: "ok" as const, value: [] },
      eventsBySeverity: { status: "ok" as const, value: [] },
      alertsGenerated: { status: "ok" as const, value: 3 },
    };

    const repository: DashboardMetricsRepository = {
      getMetrics: vi.fn().mockResolvedValue(metrics),
    };

    const useCase = new GetDashboardMetricsUseCase(repository);
    const result = await useCase.execute({
      application: "payments-api",
      severity: "HIGH",
    });

    expect(result).toEqual(metrics);
    expect(repository.getMetrics).toHaveBeenCalledOnce();
  });
});
