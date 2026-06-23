/* Update Incident Status Controller */

import { UpdateIncidentStatusUseCase } from "../../application/update-incident-status/UpdateIncidentStatusUseCase.js";
import type { Request, Response } from "express";
import { IncidentNotFoundError } from "../../application/update-incident-status/IncidentNotFoundError.js";

export class UpdateIncidentStatusController {
  constructor(private readonly useCase: UpdateIncidentStatusUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const incidentId = req.params.id;
      if (typeof incidentId !== "string") {
        res.status(400).json({ error: "Invalid incident id" });
        return;
      }

      const result = await this.useCase.execute({
        incidentId,
        status: req.body.status,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof IncidentNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
