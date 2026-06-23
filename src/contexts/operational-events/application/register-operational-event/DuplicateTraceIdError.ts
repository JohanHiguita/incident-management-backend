/* Error for the duplicate trace id */

export class DuplicateTraceIdError extends Error {
  constructor(traceId: string) {
    super(`TraceId already exists: ${traceId}`);
    this.name = "DuplicateTraceIdError";
  }
}