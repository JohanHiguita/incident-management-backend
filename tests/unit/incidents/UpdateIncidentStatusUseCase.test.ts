import { describe, expect, it, vi } from "vitest";
import { UpdateIncidentStatusUseCase } from "../../../src/contexts/incidents/application/update-incident-status/UpdateIncidentStatusUseCase.js";
import { IncidentNotFoundError } from "../../../src/contexts/incidents/application/update-incident-status/IncidentNotFoundError.js";
import { Incident } from "../../../src/contexts/incidents/domain/Incident.js";
import type { IncidentRepository } from "../../../src/contexts/incidents/domain/repositories/IncidentRepository.js";
import { Assignee } from "../../../src/contexts/incidents/domain/value-objects/Assignee.js";
import { AffectedApplication } from "../../../src/contexts/incidents/domain/value-objects/AffectedApplication.js";
import { IncidentDescription } from "../../../src/contexts/incidents/domain/value-objects/IncidentDescription.js";
import { IncidentSeverity } from "../../../src/contexts/incidents/domain/value-objects/IncidentSeverity.js";
import { IncidentTitle } from "../../../src/contexts/incidents/domain/value-objects/IncidentTitle.js";
import { UniqueEntityId } from "../../../src/shared/domain/UniqueEntityId.js";

function buildIncident(): Incident {
  return Incident.create({
    incidentTitle: IncidentTitle.create("Test incident"),
    incidentDescription: IncidentDescription.create("Description"),
    severity: IncidentSeverity.create("HIGH"),
    assignee: Assignee.create("ops-team"),
    affectedApplication: AffectedApplication.create("payments-api"),
    linkedEventIds: [UniqueEntityId.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")],
  });
}

describe("UpdateIncidentStatusUseCase", () => {
  it("updates status when incident exists", async () => {
    const incident = buildIncident();
    const repository: IncidentRepository = {
      findById: vi.fn().mockResolvedValue(incident),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new UpdateIncidentStatusUseCase(repository);
    const result = await useCase.execute({
      incidentId: incident.getId().value,
      status: "IN_PROGRESS",
    });

    expect(result.status).toBe("IN_PROGRESS");
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it("throws when incident is not found", async () => {
    const repository: IncidentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const useCase = new UpdateIncidentStatusUseCase(repository);

    await expect(
      useCase.execute({
        incidentId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        status: "IN_PROGRESS",
      }),
    ).rejects.toBeInstanceOf(IncidentNotFoundError);
  });
});
