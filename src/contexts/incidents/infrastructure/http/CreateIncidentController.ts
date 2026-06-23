import type { Request, Response } from "express";
import { CreateIncidentFromEventsUseCase } from "../../application/create-incident-from-events/CreateIncidentFromEventsUseCase.js";
import { EventsNotFoundError } from "../../application/create-incident-from-events/EventsNotFoundError.js";

export class CreateIncidentController {
  constructor(private readonly useCase: CreateIncidentFromEventsUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof EventsNotFoundError) {
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
