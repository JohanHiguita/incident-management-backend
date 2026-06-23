import { describe, expect, it, vi } from "vitest";
import { RegisterOperationalEventUseCase } from "../../../src/contexts/operational-events/application/register-operational-event/RegisterOperationalEventUseCase.js";
import { DuplicateTraceIdError } from "../../../src/contexts/operational-events/application/register-operational-event/DuplicateTraceIdError.js";
import type { OperationalEventRepository } from "../../../src/contexts/operational-events/domain/repositories/OperationalEventRepository.js";
import type { EventBus } from "../../../src/shared/infrastructure/events/EventBus.js";

describe("RegisterOperationalEventUseCase", () => {
  const validRequest = {
    sourceApplication: "payments-api",
    eventType: "PAYMENT_FAILED",
    eventDescription: "Gateway timeout",
    severity: "HIGH",
    occurredAt: "2026-06-01T12:00:00.000Z",
    traceId: "trace-use-case-001",
  };

  it("saves event and publishes domain events after persist", async () => {
    const repository: OperationalEventRepository = {
      existsByTraceId: vi.fn().mockResolvedValue(false),
      save: vi.fn().mockResolvedValue(undefined),
      findByIds: vi.fn(),
    };

    const publishedEvents: unknown[] = [];
    const eventBus: EventBus = {
      publish: vi.fn((events) => {
        publishedEvents.push(...events);
      }),
      subscribe: vi.fn(),
    };

    const useCase = new RegisterOperationalEventUseCase(repository, eventBus);
    const result = await useCase.execute(validRequest);

    expect(result.traceId).toBe(validRequest.traceId);
    expect(repository.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    expect(publishedEvents).toHaveLength(1);
  });

  it("throws when traceId already exists", async () => {
    const repository: OperationalEventRepository = {
      existsByTraceId: vi.fn().mockResolvedValue(true),
      save: vi.fn(),
      findByIds: vi.fn(),
    };

    const eventBus: EventBus = {
      publish: vi.fn(),
      subscribe: vi.fn(),
    };

    const useCase = new RegisterOperationalEventUseCase(repository, eventBus);

    await expect(useCase.execute(validRequest)).rejects.toBeInstanceOf(
      DuplicateTraceIdError,
    );
    expect(repository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
