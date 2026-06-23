import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export enum IncidentSeverityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

const ALLOWED_LEVELS = Object.values(IncidentSeverityLevel);

interface Props {
  value: IncidentSeverityLevel;
}

export class IncidentSeverity extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): IncidentSeverity {
    const value = raw.trim().toUpperCase();

    if (!value) {
      throw new Error("IncidentSeverity cannot be empty");
    }

    if (!ALLOWED_LEVELS.includes(value as IncidentSeverityLevel)) {
      throw new Error(
        `Invalid incident severity level: ${value} must be one of ${ALLOWED_LEVELS.join(", ")}`,
      );
    }

    return new IncidentSeverity({ value: value as IncidentSeverityLevel });
  }

  get value(): IncidentSeverityLevel {
    return this.props.value;
  }
}
