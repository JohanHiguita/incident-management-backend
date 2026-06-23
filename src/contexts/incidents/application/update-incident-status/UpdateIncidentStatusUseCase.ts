/* Update Incident Status Use Case */

import { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import { IncidentStatus } from "../../domain/value-objects/IncidentStatus.js";
import { IncidentNotFoundError } from "./IncidentNotFoundError.js";
import { UpdateIncidentStatusRequest } from "./UpdateIncidentStatusRequest.js";
import { UpdateIncidentStatusResponse } from "./UpdateIncidentStatusResponse.js";

export class UpdateIncidentStatusUseCase {
    constructor(private readonly repository: IncidentRepository) {}
    
    async execute(request: UpdateIncidentStatusRequest): Promise<UpdateIncidentStatusResponse> {

        const incidentId = UniqueEntityId.fromString(request.incidentId);
        const incident = await this.repository.findById(incidentId);

        if (!incident) {
            throw new IncidentNotFoundError(incidentId.value);
        }

        const newStatus = IncidentStatus.create(request.status);

        incident.updateStatus(newStatus);
        await this.repository.save(incident);

        return {
            id: incident.getId().value,
            status: incident.getIncidentStatus().value,
        };
    }
}