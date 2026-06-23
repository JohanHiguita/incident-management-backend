import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export enum AlertSeverityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

const ALLOWED_LEVELS = Object.values(AlertSeverityLevel);

interface Props {
  value: AlertSeverityLevel;
}

export class AlertSeverity extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): AlertSeverity {
    const value = raw.trim().toUpperCase();

    if (!value) {
      throw new Error("AlertSeverity cannot be empty");
    }

    if (!ALLOWED_LEVELS.includes(value as AlertSeverityLevel)) {
      throw new Error(
        `Invalid alert severity: ${value} must be one of ${ALLOWED_LEVELS.join(", ")}`,
      );
    }

    return new AlertSeverity({ value: value as AlertSeverityLevel });
  }

  get value(): AlertSeverityLevel {
    return this.props.value;
  }

  isCritical(): boolean {
    return this.value === AlertSeverityLevel.CRITICAL;
  }
}
