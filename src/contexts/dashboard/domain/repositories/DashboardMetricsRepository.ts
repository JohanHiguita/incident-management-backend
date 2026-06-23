import type { DashboardFilters } from "../DashboardFilters.js";
import type { DashboardMetrics } from "../DashboardMetrics.js";

export interface DashboardMetricsRepository {
  getMetrics(filters: DashboardFilters): Promise<DashboardMetrics>;
}
