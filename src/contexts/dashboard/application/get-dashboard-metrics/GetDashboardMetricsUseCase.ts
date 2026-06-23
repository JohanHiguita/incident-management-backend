import { DashboardFilters } from "../../domain/DashboardFilters.js";
import type { DashboardMetricsRepository } from "../../domain/repositories/DashboardMetricsRepository.js";
import type { GetDashboardMetricsRequest } from "./GetDashboardMetricsRequest.js";
import type { GetDashboardMetricsResponse } from "./GetDashboardMetricsResponse.js";

export class GetDashboardMetricsUseCase {
  constructor(
    private readonly repository: DashboardMetricsRepository,
  ) {}

  async execute(
    request: GetDashboardMetricsRequest,
  ): Promise<GetDashboardMetricsResponse> {
    const filters = DashboardFilters.create(request);

    return this.repository.getMetrics(filters);
  }
}
