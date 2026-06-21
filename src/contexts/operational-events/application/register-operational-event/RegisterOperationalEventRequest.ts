/* DTO for the request of the register operational event */

export interface RegisterOperationalEventRequest {
  sourceApplication: string;
  eventType: string;
  eventDescription: string;
  severity: string;
  occurredAt: string;
  traceId: string;
}