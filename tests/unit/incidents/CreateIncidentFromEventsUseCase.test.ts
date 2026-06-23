import { describe, expect, it, vi } from "vitest";
import { CreateIncidentFromEventsUseCase } from "../../../src/contexts/incidents/application/create-incident-from-events/CreateIncidentFromEventsUseCase.js";
import { EventsNotFoundError } from "../../../src/contexts/incidents/application/create-incident-from-events/EventsNotFoundError.js";
import type { IncidentRepository } from "../../../src/contexts/incidents/domain/repositories/IncidentRepository.js";
import type { OperationalEventRepository } from "../../../src/contexts/operational-events/domain/repositories/OperationalEventRepository.js";
import { buildOperationalEvent } from "../../helpers/operationalEventFactory.js";

describe("CreateIncidentFromEventsUseCase", () => {
  const event = buildOperationalEvent({
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    sourceApplication: "payments-api",
  });

  const request = {
    title: "Payment outage",
    description: "Multiple failures",
    affectedApplication: "payments-api",
    severity: "CRITICAL",
    assignee: "ops-team",
    eventIds: [event.getId().value],
  };

  it("creates incident when events exist and application matches", async () => {
    const incidentRepository: IncidentRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findOpen: vi.fn(),
    };

    const operationalEventRepository: OperationalEventRepository = {
      findByIds: vi.fn().mockResolvedValue([event]),
      save: vi.fn(),
      existsByTraceId: vi.fn(),
    };

    const useCase = new CreateIncidentFromEventsUseCase(
      incidentRepository,
      operationalEventRepository,
    );

    const result = await useCase.execute(request);

    expect(result.status).toBe("OPEN");
    expect(result.linkedEventIds).toEqual([event.getId().value]);
    expect(incidentRepository.save).toHaveBeenCalledOnce();
  });

  it("throws when events are missing", async () => {
    const useCase = new CreateIncidentFromEventsUseCase(
      { save: vi.fn(), findById: vi.fn(), findOpen: vi.fn() },
      {
        findByIds: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
        existsByTraceId: vi.fn(),
      },
    );

    await expect(useCase.execute(request)).rejects.toBeInstanceOf(
      EventsNotFoundError,
    );
  });

  it("throws when affected application does not match events", async () => {
    const useCase = new CreateIncidentFromEventsUseCase(
      { save: vi.fn(), findById: vi.fn(), findOpen: vi.fn() },
      {
        findByIds: vi.fn().mockResolvedValue([event]),
        save: vi.fn(),
        existsByTraceId: vi.fn(),
      },
    );

    await expect(
      useCase.execute({ ...request, affectedApplication: "orders-api" }),
    ).rejects.toThrow(/does not match linked operational events/);
  });
});
