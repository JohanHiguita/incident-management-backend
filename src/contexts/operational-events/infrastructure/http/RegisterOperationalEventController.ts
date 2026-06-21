/* Controller for registering an operational event */

import { RegisterOperationalEventUseCase } from "../../application/register-operational-event/RegisterOperationalEventUseCase.js";
import { DuplicateTraceIdError } from "../../application/register-operational-event/DuplicateTraceIdError.js";
import type { Request, Response } from "express";

export class RegisterOperationalEventController {
  constructor(private readonly useCase: RegisterOperationalEventUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof DuplicateTraceIdError) {
        res.status(409).json({ error: error.message });
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
