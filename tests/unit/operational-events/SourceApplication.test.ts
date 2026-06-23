import { describe, expect, it } from "vitest";
import { SourceApplication } from "../../../src/contexts/operational-events/domain/value-objects/SourceApplication.js";

describe("SourceApplication", () => {
  it("accepts allowed applications", () => {
    expect(SourceApplication.create("payments-api").value).toBe("payments-api");
  });

  it("rejects unknown applications", () => {
    expect(() => SourceApplication.create("unknown-app")).toThrow(
      /is not allowed/,
    );
  });
});
