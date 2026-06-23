/**
 * Seeds sample data via the public HTTP API (no direct DB access).
 * Requires the API running: npm run dev
 */

import "dotenv/config";
import { randomInt, randomUUID } from "node:crypto";

const API_BASE =
  process.env.POPULATE_API_URL ??
  `http://localhost:${process.env.PORT ?? 3000}`;

const APPLICATIONS = [
  "payments-api",
  "orders-api",
  "inventory-service",
  "notifications-service",
  "auth-service",
  "billing-legacy",
  "shipping-api",
] as const;

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const SEVERITY_WEIGHTS: Array<{ value: (typeof SEVERITIES)[number]; weight: number }> = [
  { value: "LOW", weight: 28 },
  { value: "MEDIUM", weight: 32 },
  { value: "HIGH", weight: 25 },
  { value: "CRITICAL", weight: 15 },
];

/** Some apps receive more traffic than others (uneven dashboard bars). */
const APPLICATION_WEIGHTS: Array<{ value: (typeof APPLICATIONS)[number]; weight: number }> = [
  { value: "payments-api", weight: 22 },
  { value: "orders-api", weight: 18 },
  { value: "inventory-service", weight: 14 },
  { value: "notifications-service", weight: 12 },
  { value: "auth-service", weight: 16 },
  { value: "billing-legacy", weight: 8 },
  { value: "shipping-api", weight: 10 },
];

const EVENT_TYPES = [
  "PAYMENT_FAILED",
  "ORDER_TIMEOUT",
  "STOCK_LOW",
  "AUTH_ERROR",
  "NOTIFICATION_DELAY",
  "SHIPMENT_DELAY",
  "BILLING_MISMATCH",
  "CHECKOUT_ERROR",
  "WEBHOOK_RETRY",
  "CACHE_MISS",
] as const;

const INCIDENT_TITLES = [
  "Degradación en checkout",
  "Latencia en pipeline de órdenes",
  "Desfase de inventario",
  "Fallos de autenticación",
  "Retraso en notificaciones",
  "Conciliación billing legacy",
  "Error en etiquetas de envío",
  "Pico de errores 5xx",
  "Timeout en integración externa",
] as const;

const ASSIGNEES = [
  "ops-payments",
  "ops-orders",
  "ops-inventory",
  "ops-security",
  "ops-comms",
  "ops-billing",
  "ops-logistics",
  "ops-platform",
] as const;

const STATUS_PATHS: string[][] = [
  [],
  ["IN_PROGRESS"],
  ["IN_PROGRESS", "RESOLVED"],
  ["RESOLVED"],
  ["IN_PROGRESS", "RESOLVED", "CLOSED"],
];

interface RegisterEventBody {
  sourceApplication: string;
  eventType: string;
  eventDescription: string;
  severity: string;
  occurredAt: string;
  traceId: string;
}

interface RegisterEventResponse {
  id: string;
  traceId: string;
}

interface CreatedEvent extends RegisterEventResponse {
  application: string;
  severity: string;
}

interface CreateIncidentBody {
  title: string;
  description: string;
  affectedApplication: string;
  severity: string;
  assignee: string;
  eventIds: string[];
}

interface CreateIncidentResponse {
  id: string;
  status: string;
}

interface DashboardMetricsSnapshot {
  alertsGenerated?: { status: string; value?: number; error?: string };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : text || response.statusText;

    throw new Error(`${method} ${path} → ${response.status}: ${detail}`);
  }

  return payload as T;
}

function pickWeighted<T extends string>(
  options: Array<{ value: T; weight: number }>,
): T {
  const total = options.reduce((sum, option) => sum + option.weight, 0);
  let roll = randomInt(0, total);

  for (const option of options) {
    if (roll < option.weight) {
      return option.value;
    }
    roll -= option.weight;
  }

  return options[options.length - 1].value;
}

function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("pickRandom called with an empty array");
  }

  return items[randomInt(0, items.length)];
}

function pickRandomSubset<T>(items: T[], min: number, max: number): T[] {
  if (items.length === 0) {
    return [];
  }

  const cappedMax = Math.min(max, items.length);
  const cappedMin = Math.min(min, cappedMax);
  const count =
    cappedMin === cappedMax
      ? cappedMin
      : randomInt(cappedMin, cappedMax + 1);

  const pool = [...items];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

function randomOccurredAt(maxDaysAgo: number): string {
  const daysAgo = randomInt(0, maxDaysAgo);
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0);
  return date.toISOString();
}

async function ensureApiIsUp(): Promise<void> {
  await request<{ status: string }>("GET", "/health");
}

async function registerEvent(
  index: number,
  runId: string,
  overrides?: {
    severity?: (typeof SEVERITIES)[number];
    application?: (typeof APPLICATIONS)[number];
  },
): Promise<CreatedEvent> {
  const application = overrides?.application ?? pickWeighted(APPLICATION_WEIGHTS);
  const severity = overrides?.severity ?? pickWeighted(SEVERITY_WEIGHTS);
  const eventType = pickRandom(EVENT_TYPES);

  const response = await request<RegisterEventResponse>(
    "POST",
    "/api/v1/operational-events",
    {
      sourceApplication: application,
      eventType,
      eventDescription: `Populate #${index + 1}: ${eventType} (${severity}) en ${application}`,
      severity,
      occurredAt: randomOccurredAt(30),
      traceId: `populate-${runId}-${index}-${randomUUID().slice(0, 6)}`,
    } satisfies RegisterEventBody,
  );

  return { ...response, application, severity };
}

async function registerCriticalAlerts(
  runId: string,
  startIndex: number,
  count: number,
): Promise<CreatedEvent[]> {
  const created: CreatedEvent[] = [];

  for (let i = 0; i < count; i += 1) {
    const event = await registerEvent(startIndex + i, runId, {
      severity: "CRITICAL",
      application: pickWeighted(APPLICATION_WEIGHTS),
    });
    created.push(event);
  }

  return created;
}

async function getAlertMetric(): Promise<{
  status: string;
  value?: number;
  error?: string;
}> {
  const metrics = await request<DashboardMetricsSnapshot>(
    "GET",
    "/api/v1/dashboard/metrics",
  );

  return (
    metrics.alertsGenerated ?? {
      status: "error",
      error: "alertsGenerated missing in response",
    }
  );
}

async function ensureAlertsInfrastructure(): Promise<void> {
  const metric = await getAlertMetric();

  if (metric.status === "error" && metric.error?.includes("alerts")) {
    throw new Error(
      'La tabla "alerts" no existe. Ejecuta primero: npm run migrate',
    );
  }
}

async function createIncident(
  params: CreateIncidentBody,
): Promise<CreateIncidentResponse> {
  return request<CreateIncidentResponse>("POST", "/api/v1/incidents", params);
}

async function updateIncidentStatus(
  incidentId: string,
  status: string,
): Promise<void> {
  await request("PATCH", `/api/v1/incidents/${incidentId}/status`, { status });
}

async function waitForAlerts(
  baseline: number,
  expectedNew: number,
  maxAttempts = 20,
): Promise<number> {
  const target = baseline + expectedNew;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const metric = await getAlertMetric();

    if (metric.status !== "ok") {
      if (metric.error?.includes("alerts")) {
        throw new Error(
          'La tabla "alerts" no existe. Ejecuta primero: npm run migrate',
        );
      }
      continue;
    }

    const total = metric.value ?? 0;

    if (total >= target) {
      return total;
    }

    process.stdout.write(".");
  }

  const metric = await getAlertMetric();
  throw new Error(
    `Timeout esperando alertas (objetivo ≥ ${target}, actual ${metric.value ?? 0}). ` +
      "Verifica que el API esté en marcha y que HU3 esté activa.",
  );
}

function groupEventsByApplication(
  events: CreatedEvent[],
): Map<string, CreatedEvent[]> {
  const map = new Map<string, CreatedEvent[]>();

  for (const event of events) {
    const list = map.get(event.application) ?? [];
    list.push(event);
    map.set(event.application, list);
  }

  return map;
}

async function main(): Promise<void> {
  const runId = randomUUID().slice(0, 8);
  const eventCount = randomInt(48, 72);

  console.log(`API base: ${API_BASE}`);
  console.log(`Run id:   ${runId}`);
  console.log("Checking API health...");

  await ensureApiIsUp();
  await ensureAlertsInfrastructure();

  const baselineAlerts = (await getAlertMetric()).value ?? 0;
  console.log(`API is up. Alertas actuales en BD: ${baselineAlerts}\n`);

  const createdEvents: CreatedEvent[] = [];

  console.log(`Registering ${eventCount} operational events (random distribution)...`);

  for (let i = 0; i < eventCount; i += 1) {
    const event = await registerEvent(i, runId);
    createdEvents.push(event);
    if ((i + 1) % 10 === 0) process.stdout.write(".");
  }

  const eventsByApp = groupEventsByApplication(createdEvents);

  console.log("\n\nEvents per application (this run):");
  for (const app of APPLICATIONS) {
    console.log(`  ${app}: ${eventsByApp.get(app)?.length ?? 0}`);
  }

  const criticalInBatch = createdEvents.filter(
    (event) => event.severity === "CRITICAL",
  ).length;

  const extraCriticalCount = randomInt(10, 16);
  console.log(
    `\nRegistering ${extraCriticalCount} extra CRITICAL events (alerts via HU3)...`,
  );

  const criticalEvents = await registerCriticalAlerts(
    runId,
    eventCount,
    extraCriticalCount,
  );
  createdEvents.push(...criticalEvents);

  for (const event of criticalEvents) {
    const list = eventsByApp.get(event.application) ?? [];
    list.push(event);
    eventsByApp.set(event.application, list);
  }

  const expectedNewAlerts = criticalInBatch + extraCriticalCount;
  console.log(
    `CRITICAL en esta corrida: ${expectedNewAlerts} ` +
      `(${criticalInBatch} del lote + ${extraCriticalCount} dedicados)`,
  );
  console.log("Waiting for async alerts");

  const totalAlerts = await waitForAlerts(baselineAlerts, expectedNewAlerts);
  console.log(`\n  Alertas en BD: ${totalAlerts} (+${expectedNewAlerts} aprox. esta corrida)`);

  const incidentCount = randomInt(6, 10);
  const appsWithEvents = APPLICATIONS.filter(
    (app) => (eventsByApp.get(app)?.length ?? 0) > 0,
  );

  console.log(`Creating ${incidentCount} incidents...`);

  for (let i = 0; i < incidentCount; i += 1) {
    const application = pickRandom(appsWithEvents);
    const appEvents = eventsByApp.get(application) ?? [];
    const linkedEvents = pickRandomSubset(appEvents, 1, 3);
    const severity = pickRandom(linkedEvents).severity;
    const statusPath = pickRandom(STATUS_PATHS);

    const incident = await createIncident({
      title: `${pickRandom(INCIDENT_TITLES)} (${application})`,
      description: `Incidente de prueba #${i + 1} generado por populate`,
      affectedApplication: application,
      severity,
      assignee: pickRandom(ASSIGNEES),
      eventIds: linkedEvents.map((event) => event.id),
    });

    for (const status of statusPath) {
      await updateIncidentStatus(incident.id, status);
    }

    const finalStatus = statusPath.at(-1) ?? "OPEN";
    console.log(`  • ${incident.id.slice(0, 8)}… ${application} → ${finalStatus}`);
  }

  const metrics = await request<Record<string, unknown>>(
    "GET",
    "/api/v1/dashboard/metrics",
  );

  console.log("\nDone. Dashboard metrics snapshot:");
  console.log(JSON.stringify(metrics, null, 2));
  console.log("\nOpen the frontend dashboard to visualize the seeded data.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nPopulate failed: ${message}`);
  console.error("Make sure Docker Postgres is up, run npm run migrate, then npm run dev.");
  process.exit(1);
});
