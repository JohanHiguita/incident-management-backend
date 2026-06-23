export const ALLOWED_APPLICATIONS = [
  "payments-api",
  "orders-api",
  "inventory-service",
  "notifications-service",
  "auth-service",
  "billing-legacy",
  "shipping-api",
] as const;

export type AllowedApplicationName = (typeof ALLOWED_APPLICATIONS)[number];

const ALLOWED_SET = new Set<string>(ALLOWED_APPLICATIONS);

export function isAllowedApplication(value: string): boolean {
  return ALLOWED_SET.has(value);
}

export function formatAllowedApplications(): string {
  return ALLOWED_APPLICATIONS.join(", ");
}
