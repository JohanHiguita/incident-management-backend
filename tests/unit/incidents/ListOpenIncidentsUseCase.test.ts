import { describe, expect, it, vi } from "vitest";
import { ListOpenIncidentsUseCase } from "../../../src/contexts/incidents/application/list-open-incidents/ListOpenIncidentsUseCase.js";
import { Incident } from "../../../src/contexts/incidents/domain/Incident.js";
import type { IncidentRepository } from "../../../src/contexts/incidents/domain/repositories/IncidentRepository.js";
import { Assignee } from "../../../src/contexts/incidents/domain/value-objects/Assignee.js";
import { AffectedApplication } from "../../../src/contexts/incidents/domain/value-objects/AffectedApplication.js";
import { IncidentDescription } from "../../../src/contexts/incidents/domain/value-objects/IncidentDescription.js";
import { IncidentSeverity } from "../../../src/contexts/incidents/domain/value-objects/IncidentSeverity.js";
import { IncidentStatus } from "../../../src/contexts/incidents/domain/value-objects/IncidentStatus.js";
import { IncidentTitle } from "../../../src/contexts/incidents/domain/value-objects/IncidentTitle.js";
import { UniqueEntityId } from "../../../src/shared/domain/UniqueEntityId.js";

function buildIncident(params: {
  id: string;
  status: "OPEN" | "IN_PROGRESS";
  affectedApplication: string;
  severity: string;
  createdAt: Date;
}): Incident {
  return Incident.reconstitute(UniqueEntityId.fromString(params.id), {
    incidentTitle: IncidentTitle.create("Test incident"),
    incidentDescription: IncidentDescription.create("Description"),
    incidentStatus: IncidentStatus.create(params.status),
    severity: IncidentSeverity.create(params.severity),
    assignee: Assignee.create("ops-team"),
    affectedApplication: AffectedApplication.create(params.affectedApplication),
    createdAt: params.createdAt,
    linkedEventIds: [
      UniqueEntityId.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    ],
  });
}

describe("ListOpenIncidentsUseCase", () => {
  it("returns mapped open incidents from repository", async () => {
    const createdAt = new Date("2026-06-19T10:00:00.000Z");
    const incidents = [
      buildIncident({
        id: "11111111-1111-1111-1111-111111111111",
        status: "OPEN",
        affectedApplication: "payments-api",
        severity: "CRITICAL",
        createdAt,
      }),
      buildIncident({
        id: "22222222-2222-2222-2222-222222222222",
        status: "IN_PROGRESS",
        affectedApplication: "orders-api",
        severity: "HIGH",
        createdAt,
      }),
    ];

    const repository: IncidentRepository = {
      findOpen: vi.fn().mockResolvedValue(incidents),
      save: vi.fn(),
      findById: vi.fn(),
    };

    const useCase = new ListOpenIncidentsUseCase(repository);
    const result = await useCase.execute();

    expect(repository.findOpen).toHaveBeenCalledOnce();
    expect(result).toEqual([
      {
        id: "11111111-1111-1111-1111-111111111111",
        affectedApplication: "payments-api",
        severity: "CRITICAL",
        status: "OPEN",
        createdAt: "2026-06-19T10:00:00.000Z",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        affectedApplication: "orders-api",
        severity: "HIGH",
        status: "IN_PROGRESS",
        createdAt: "2026-06-19T10:00:00.000Z",
      },
    ]);
  });

  it("returns empty array when there are no open incidents", async () => {
    const repository: IncidentRepository = {
      findOpen: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      findById: vi.fn(),
    };

    const useCase = new ListOpenIncidentsUseCase(repository);
    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(repository.findOpen).toHaveBeenCalledOnce();
  });
});
