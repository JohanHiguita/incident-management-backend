import { describe, expect, it, vi } from "vitest";
import { CreateAlertOnCriticalEventHandler } from "../../../src/contexts/alerts/application/create-alert-on-critical-event/CreateAlertOnCriticalEventHandler.js";
import type { AlertRepository } from "../../../src/contexts/alerts/domain/repositories/AlertRepository.js";
import { OperationalEventRegistered } from "../../../src/contexts/operational-events/domain/events/OperationalEventRegistered.js";

describe("CreateAlertOnCriticalEventHandler", () => {
  it("persists alert for CRITICAL operational events", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const repository: AlertRepository = { save };

    const handler = new CreateAlertOnCriticalEventHandler(repository);
    const event = new OperationalEventRegistered(
      "cccccccc-cccc-cccc-cccc-cccccccccccc",
      "payments-api",
      "CRITICAL",
      "trace-1",
      new Date("2026-06-01T12:00:00.000Z"),
    );

    await handler.handle(event);

    expect(save).toHaveBeenCalledOnce();
    const alert = save.mock.calls[0][0];
    expect(alert.getSourceEventId().value).toBe(event.eventId);
    expect(alert.getSeverity().value).toBe("CRITICAL");
  });

  it("ignores non-critical severities", async () => {
    const save = vi.fn();
    const handler = new CreateAlertOnCriticalEventHandler({ save });

    await handler.handle(
      new OperationalEventRegistered(
        "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "payments-api",
        "LOW",
        "trace-2",
        new Date("2026-06-01T12:00:00.000Z"),
      ),
    );

    expect(save).not.toHaveBeenCalled();
  });
});
