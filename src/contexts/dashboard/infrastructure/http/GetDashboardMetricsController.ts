import type { Request, Response } from "express";
import { GetDashboardMetricsUseCase } from "../../application/get-dashboard-metrics/GetDashboardMetricsUseCase.js";

export class GetDashboardMetricsController {
  constructor(private readonly useCase: GetDashboardMetricsUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.useCase.execute({
        application: readQueryParam(req.query.application),
        fromDate: readQueryParam(req.query.fromDate),
        toDate: readQueryParam(req.query.toDate),
        severity: readQueryParam(req.query.severity),
        status: readQueryParam(req.query.status),
      });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}

function readQueryParam(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}
