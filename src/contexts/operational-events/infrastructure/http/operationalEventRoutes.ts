/* Operational Event Routes */

import { Router } from "express";
import { RegisterOperationalEventController } from "./RegisterOperationalEventController.js";
import { RegisterOperationalEventUseCase } from "../../application/register-operational-event/RegisterOperationalEventUseCase.js";
import { PostgresOperationalEventRepository } from "../persistence/PostgresOperationalEventRepository.js";
import { eventBus } from "../../../../bootstrap/eventHandlers.js";

const repository = new PostgresOperationalEventRepository();
const useCase = new RegisterOperationalEventUseCase(repository, eventBus);
const controller = new RegisterOperationalEventController(useCase);

const router = Router();

router.post("/operational-events", (req, res) => controller.handle(req, res));

export default router;
