import { describe, expect, it } from "vitest";
import { OperationalEvent } from "../../../src/contexts/operational-events/domain/OperationalEvent.js";
import { OperationalEventRegistered } from "../../../src/contexts/operational-events/domain/events/OperationalEventRegistered.js";
import { buildOperationalEventCreateProps } from "../../helpers/operationalEventFactory.js";
import { UniqueEntityId } from "../../../src/shared/domain/UniqueEntityId.js";

describe("OperationalEvent", () => {
  it("emits OperationalEventRegistered on create", () => {
    const event = OperationalEvent.create(
      buildOperationalEventCreateProps("CRITICAL"),
    );
    const domainEvents = event.pullDomainEvents();

    expect(domainEvents).toHaveLength(1);
    const registered = domainEvents[0];
    expect(registered).toBeInstanceOf(OperationalEventRegistered);
    expect((registered as OperationalEventRegistered).severity).toBe("CRITICAL");
    expect((registered as OperationalEventRegistered).eventId).toBe(
      event.getId().value,
    );
  });

  it("does not emit domain events on reconstitute", () => {
    const props = buildOperationalEventCreateProps();
    const event = OperationalEvent.reconstitute(
      UniqueEntityId.fromString("22222222-2222-2222-2222-222222222222"),
      props,
    );

    expect(event.pullDomainEvents()).toHaveLength(0);
  });
});
