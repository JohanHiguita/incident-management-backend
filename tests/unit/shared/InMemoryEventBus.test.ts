import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DomainEvent } from "../../../src/shared/domain/DomainEvent.js";
import { InMemoryEventBus } from "../../../src/shared/infrastructure/events/InMemoryEventBus.js";

describe("InMemoryEventBus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dispatches subscribed handlers asynchronously", async () => {
    const bus = new InMemoryEventBus();
    const handle = vi.fn().mockResolvedValue(undefined);

    bus.subscribe("test.event", { handle });

    const domainEvent: DomainEvent = {
      eventName: "test.event",
      occurredOn: new Date("2026-06-01T12:00:00.000Z"),
    };

    bus.publish([domainEvent]);

    expect(handle).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(handle).toHaveBeenCalledWith(domainEvent);
  });

  it("isolates handler failures without breaking publish", async () => {
    const bus = new InMemoryEventBus();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    bus.subscribe("test.event", {
      handle: vi.fn().mockRejectedValue(new Error("handler failed")),
    });

    bus.publish([
      {
        eventName: "test.event",
        occurredOn: new Date(),
      },
    ]);

    await vi.runAllTimersAsync();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
