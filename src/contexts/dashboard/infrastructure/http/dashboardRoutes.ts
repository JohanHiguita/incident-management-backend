import { Router } from "express";
import { GetDashboardMetricsUseCase } from "../../application/get-dashboard-metrics/GetDashboardMetricsUseCase.js";
import { PostgresDashboardMetricsRepository } from "../persistence/PostgresDashboardMetricsRepository.js";
import { GetDashboardMetricsController } from "./GetDashboardMetricsController.js";

const repository = new PostgresDashboardMetricsRepository();
const useCase = new GetDashboardMetricsUseCase(repository);
const controller = new GetDashboardMetricsController(useCase);

const router = Router();

router.get("/dashboard/metrics", (req, res) => controller.handle(req, res));

export default router;
