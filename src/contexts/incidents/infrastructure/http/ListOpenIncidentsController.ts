import type { Request, Response } from "express";
import { ListOpenIncidentsUseCase } from "../../application/list-open-incidents/ListOpenIncidentsUseCase.js";

export class ListOpenIncidentsController {
  constructor(private readonly useCase: ListOpenIncidentsUseCase) {}

  async handle(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}
