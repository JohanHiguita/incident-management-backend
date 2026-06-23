import { Router } from "express";
import { CreateIncidentController } from "./CreateIncidentController.js";
import { CreateIncidentFromEventsUseCase } from "../../application/create-incident-from-events/CreateIncidentFromEventsUseCase.js";
import { PostgresIncidentRepository } from "../persistence/PostgresIncidentRepository.js";
import { PostgresOperationalEventRepository } from "../../../operational-events/infrastructure/persistence/PostgresOperationalEventRepository.js";
import { UpdateIncidentStatusUseCase } from "../../application/update-incident-status/UpdateIncidentStatusUseCase.js";
import { UpdateIncidentStatusController } from "./UpdateIncidentStatusController.js";

/* Create Incident from Events */
const incidentRepository = new PostgresIncidentRepository();
const operationalEventRepository = new PostgresOperationalEventRepository();
const useCase = new CreateIncidentFromEventsUseCase(
  incidentRepository,
  operationalEventRepository,
);
const createIncidentController = new CreateIncidentController(useCase);

/* Update Incident Status */
const updateIncidentStatusUseCase = new UpdateIncidentStatusUseCase(incidentRepository);
const updateIncidentStatusController = new UpdateIncidentStatusController(updateIncidentStatusUseCase);

const router = Router();

router.post("/incidents", (req, res) => createIncidentController.handle(req, res));

router.patch("/incidents/:id/status", (req, res) => updateIncidentStatusController.handle(req, res));

export default router;
