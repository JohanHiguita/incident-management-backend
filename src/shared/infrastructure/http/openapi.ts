/**
 * OpenAPI 3.0 specification for the Coordinadora incident monitoring API.
 */

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Coordinadora — Incident & Operations Monitoring API",
    version: "1.0.0",
    description:
      "API for operational events (HU1), incidents (HU2), async alerts (HU3), and dashboard metrics (HU4).",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Service health" },
    { name: "Operational Events", description: "HU1 — Register operational events" },
    { name: "Incidents", description: "HU2 — Incident lifecycle" },
    { name: "Dashboard", description: "HU4 — Operational dashboard metrics" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/operational-events": {
      post: {
        tags: ["Operational Events"],
        summary: "Register an operational event",
        description:
          "Persists an operational event. CRITICAL events trigger an async alert (HU3).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterOperationalEventRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Event registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterOperationalEventResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": {
            description: "Duplicate traceId",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/v1/incidents": {
      post: {
        tags: ["Incidents"],
        summary: "Create incident from operational events",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateIncidentFromEventsRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Incident created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateIncidentFromEventsResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": {
            description: "One or more event IDs not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/v1/incidents/{id}/status": {
      patch: {
        tags: ["Incidents"],
        summary: "Update incident status",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Incident identifier",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateIncidentStatusRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateIncidentStatusResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": {
            description: "Incident not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/api/v1/dashboard/metrics": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard metrics",
        description:
          "Aggregated metrics for the operational dashboard. Each metric may succeed or fail independently (partial response).",
        parameters: [
          {
            name: "application",
            in: "query",
            schema: { $ref: "#/components/schemas/AllowedApplication" },
            description: "Filter by application (events, incidents, alerts)",
          },
          {
            name: "fromDate",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Inclusive start date (ISO 8601)",
          },
          {
            name: "toDate",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Inclusive end date (ISO 8601)",
          },
          {
            name: "severity",
            in: "query",
            schema: { $ref: "#/components/schemas/DashboardSeverityFilter" },
            description: "Filter by severity",
          },
          {
            name: "status",
            in: "query",
            schema: { $ref: "#/components/schemas/IncidentStatus" },
            description: "Filter incidents by status (incident metrics only)",
          },
        ],
        responses: {
          "200": {
            description: "Dashboard metrics (per-widget ok or error)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardMetrics" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
      AllowedApplication: {
        type: "string",
        enum: [
          "payments-api",
          "orders-api",
          "inventory-service",
          "notifications-service",
          "auth-service",
          "billing-legacy",
          "shipping-api",
        ],
      },
      EventSeverity: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
      IncidentSeverity: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
      DashboardSeverityFilter: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
      IncidentStatus: {
        type: "string",
        enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      },
      RegisterOperationalEventRequest: {
        type: "object",
        required: [
          "sourceApplication",
          "eventType",
          "eventDescription",
          "severity",
          "occurredAt",
          "traceId",
        ],
        properties: {
          sourceApplication: { $ref: "#/components/schemas/AllowedApplication" },
          eventType: { type: "string", example: "PAYMENT_FAILED" },
          eventDescription: { type: "string", example: "Gateway timeout during checkout" },
          severity: { $ref: "#/components/schemas/EventSeverity" },
          occurredAt: { type: "string", format: "date-time", example: "2026-06-19T12:00:00.000Z" },
          traceId: { type: "string", example: "trace-abc-001" },
        },
      },
      RegisterOperationalEventResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          traceId: { type: "string" },
        },
        required: ["id", "traceId"],
      },
      CreateIncidentFromEventsRequest: {
        type: "object",
        required: [
          "title",
          "description",
          "affectedApplication",
          "severity",
          "assignee",
          "eventIds",
        ],
        properties: {
          title: { type: "string", example: "Payment degradation" },
          description: { type: "string", example: "Multiple payment failures detected" },
          affectedApplication: { $ref: "#/components/schemas/AllowedApplication" },
          severity: { $ref: "#/components/schemas/IncidentSeverity" },
          assignee: { type: "string", example: "ops-team" },
          eventIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
            minItems: 1,
          },
        },
      },
      CreateIncidentFromEventsResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          status: { type: "string", example: "OPEN" },
          affectedApplication: { type: "string" },
          linkedEventIds: {
            type: "array",
            items: { type: "string", format: "uuid" },
          },
        },
        required: ["id", "title", "status", "affectedApplication", "linkedEventIds"],
      },
      UpdateIncidentStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/IncidentStatus" },
        },
      },
      UpdateIncidentStatusResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          status: { $ref: "#/components/schemas/IncidentStatus" },
        },
        required: ["id", "status"],
      },
      CountByLabel: {
        type: "object",
        properties: {
          label: { type: "string" },
          count: { type: "integer" },
        },
        required: ["label", "count"],
      },
      MetricResultNumber: {
        oneOf: [
          {
            type: "object",
            required: ["status", "value"],
            properties: {
              status: { type: "string", enum: ["ok"] },
              value: { type: "integer" },
            },
          },
          {
            type: "object",
            required: ["status", "error"],
            properties: {
              status: { type: "string", enum: ["error"] },
              error: { type: "string" },
            },
          },
        ],
      },
      MetricResultCountByLabelArray: {
        oneOf: [
          {
            type: "object",
            required: ["status", "value"],
            properties: {
              status: { type: "string", enum: ["ok"] },
              value: {
                type: "array",
                items: { $ref: "#/components/schemas/CountByLabel" },
              },
            },
          },
          {
            type: "object",
            required: ["status", "error"],
            properties: {
              status: { type: "string", enum: ["error"] },
              error: { type: "string" },
            },
          },
        ],
      },
      DashboardMetrics: {
        type: "object",
        properties: {
          openIncidents: { $ref: "#/components/schemas/MetricResultNumber" },
          resolvedIncidents: { $ref: "#/components/schemas/MetricResultNumber" },
          eventsByApplication: { $ref: "#/components/schemas/MetricResultCountByLabelArray" },
          eventsBySeverity: { $ref: "#/components/schemas/MetricResultCountByLabelArray" },
          alertsGenerated: { $ref: "#/components/schemas/MetricResultNumber" },
        },
        required: [
          "openIncidents",
          "resolvedIncidents",
          "eventsByApplication",
          "eventsBySeverity",
          "alertsGenerated",
        ],
      },
    },
    responses: {
      BadRequest: {
        description: "Validation or domain rule error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      InternalError: {
        description: "Unexpected server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
} as const;
