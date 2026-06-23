import { isAllowedApplication } from "../../../shared/domain/AllowedApplications.js";
import {
  formatIncidentStatusValues,
  isIncidentStatus,
} from "../../../shared/domain/IncidentStatusValues.js";
import {
  formatDashboardSeverityFilterValues,
  isDashboardSeverityFilter,
} from "./DashboardSeverityFilterValues.js";

export interface DashboardFiltersProps {
  application?: string;
  fromDate?: Date;
  toDate?: Date;
  severity?: string;
  status?: string;
}

export class DashboardFilters {
  readonly application?: string;
  readonly fromDate?: Date;
  readonly toDate?: Date;
  readonly severity?: string;
  readonly status?: string;

  private constructor(props: DashboardFiltersProps) {
    this.application = props.application;
    this.fromDate = props.fromDate;
    this.toDate = props.toDate;
    this.severity = props.severity;
    this.status = props.status;
  }

  static create(raw: {
    application?: string;
    fromDate?: string;
    toDate?: string;
    severity?: string;
    status?: string;
  }): DashboardFilters {
    const application = normalizeOptional(raw.application);

    if (application && !isAllowedApplication(application)) {
      throw new Error(`Invalid application filter: ${application}`);
    }

    const severity = normalizeOptional(raw.severity)?.toUpperCase();

    if (severity && !isDashboardSeverityFilter(severity)) {
      throw new Error(
        `Invalid severity filter: ${severity} must be one of ${formatDashboardSeverityFilterValues()}`,
      );
    }

    const status = normalizeOptional(raw.status)?.toUpperCase();

    if (status && !isIncidentStatus(status)) {
      throw new Error(
        `Invalid status filter: ${status} must be one of ${formatIncidentStatusValues()}`,
      );
    }

    const fromDate = parseOptionalDate(raw.fromDate, "fromDate");
    const toDate = parseOptionalDate(raw.toDate, "toDate");

    if (fromDate && toDate && fromDate > toDate) {
      throw new Error("fromDate cannot be after toDate");
    }

    return new DashboardFilters({
      application,
      fromDate,
      toDate,
      severity,
      status,
    });
  }
}

/* Helper functions to normalize the input values */
function normalizeOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/* Helper function to parse the optional date */
function parseOptionalDate(
  raw: string | undefined,
  fieldName: string,
): Date | undefined {
  const value = normalizeOptional(raw);

  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }

  return date;
}
